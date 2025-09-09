import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is authenticated and is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const callerRole = profile?.role;

    if (!callerRole || (callerRole !== 'admin' && callerRole !== 'contributor')) {
      return new Response(
        JSON.stringify({ error: 'Admin or contributor access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);

    // Handle different operations
    if (method === 'GET' && pathSegments.length === 2 && pathSegments[0] === 'admin-users' && pathSegments[1] === 'users') {
      // Get all users
      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      const users = [];
      for (const profile of profilesData) {
        try {
          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          if (authData.user) {
            users.push({
              id: authData.user.id,
              email: authData.user.email,
              name: profile.name,
              role: profile.role,
              createdAt: authData.user.created_at,
              lastSignInAt: authData.user.last_sign_in_at,
              isActive: profile.is_active ?? true,
              emailConfirmedAt: authData.user.email_confirmed_at,
              createdBy: profile.created_by,
            });
          }
        } catch (error) {
          console.error(`Error fetching auth data for user ${profile.id}:`, error);
        }
      }

      return new Response(
        JSON.stringify(users),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'POST' && pathSegments.length === 2 && pathSegments[0] === 'admin-users' && pathSegments[1] === 'users') {
      // Create user
      const body = await req.json();
      const { email, password, name, role } = body;

      // Contributor-specific restriction for user creation
      if (callerRole === 'contributor' && role !== 'streaming') {
        throw new Error('Permission denied: Contributors can only create users with the "streaming" role.');
      }
      // Prevent contributors from creating admin users
      if (callerRole === 'contributor' && role === 'admin') {
        throw new Error('Permission denied: Contributors cannot create admin users.');
      }
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        throw new Error('User created but profile not found');
      }

      const newUser = {
        id: authData.user.id,
        email: authData.user.email,
        name: profileData.name,
        role: profileData.role,
        createdAt: authData.user.created_at,
        isActive: profileData.is_active ?? true,
        emailConfirmedAt: authData.user.email_confirmed_at,
        createdBy: user.id,
      };

      return new Response(
        JSON.stringify(newUser),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PUT' && pathSegments.length === 3 && pathSegments[0] === 'admin-users' && pathSegments[1] === 'users') {
      // Update user
      const userId = pathSegments[2];
      const body = await req.json();
      const { name, role, isActive } = body;
      
      // Contributor-specific restriction for user updates
      if (callerRole === 'contributor') {
        // Prevent contributors from assigning admin role
        if (role === 'admin') {
          throw new Error('Permission denied: Contributors cannot assign the "admin" role.');
        }
        // Prevent contributors from deactivating/deleting admin users
        // This check is more complex and might require fetching the target user's role first
      }

      // Check if this is a self-update that would remove admin privileges
      if (user.id === userId) {
        const isCurrentlyAdmin = profile.role === 'admin';
        const wouldRemoveAdmin = role && role !== 'admin';
        const wouldDeactivate = isActive === false;
        
        if (isCurrentlyAdmin && (wouldRemoveAdmin || wouldDeactivate)) {
          // Check if this user is the last admin
          const { data: adminCount } = await supabaseAdmin
            .from('user_profiles')
            .select('id', { count: 'exact' })
            .eq('role', 'admin')
            .eq('is_active', true);
          
          if (adminCount && adminCount.length <= 1) {
            throw new Error('Cannot remove admin privileges or deactivate the last admin account');
          }
        }
      }

      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update({ name, role, is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (!authData.user) {
        throw new Error('User not found');
      }

      const updatedUser = {
        id: authData.user.id,
        email: authData.user.email,
        name: data.name,
        role: data.role,
        createdAt: authData.user.created_at,
        lastSignInAt: authData.user.last_sign_in_at,
        isActive: data.is_active ?? true,
        emailConfirmedAt: authData.user.email_confirmed_at,
        createdBy: data.created_by,
      };

      return new Response(
        JSON.stringify(updatedUser),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'DELETE' && pathSegments.length === 3 && pathSegments[0] === 'admin-users' && pathSegments[1] === 'users') {
      // Delete user
      const userId = pathSegments[2];
      
      // Contributor-specific restriction for user deletion
      if (callerRole === 'contributor') {
        const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
          .from('user_profiles')
          .select('role')
          .eq('id', userId)
          .single();
        if (targetProfileError || targetProfile?.role === 'admin') {
          throw new Error('Permission denied: Contributors cannot delete admin users.');
        }
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (error) {
        throw new Error(error.message);
      }

      return new Response(
        JSON.stringify({ message: 'User deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-users function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});