const { createClient } = require('@supabase/supabase-js');

// We use the admin client or directly decode JWT.
// With express, we'll verify the JWT using supabase admin client.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Auth error' });
  }
};

module.exports = authMiddleware;
