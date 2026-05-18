const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient'); // Initialized with SERVICE_ROLE_KEY

// POST /api/users/create
router.post('/create', async (req, res) => {
  try {
    const { email, password, full_name, role, department, salary } = req.body;
    
    // 1. Create Auth User using Admin API
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: password || '12345678', // Provide a default if not passed
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authErr) throw authErr;
    
    const newAuthId = authData.user.id;
    
    // 2. Upsert profile (in case there's an auto-trigger, we update it; if not, we insert it)
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: newAuthId,
      email,
      full_name,
      role: role || 'viewer',
      department: department || '',
      salary: parseFloat(salary) || 0
    });
    
    if (profileErr) throw profileErr;
    
    res.json({ success: true, user: authData.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/update
router.post('/update', async (req, res) => {
  try {
    const { id, full_name, role, department, salary, password } = req.body;
    
    // 1. Update Profile
    const { error: profileErr } = await supabase.from('profiles').update({
      full_name,
      role,
      department,
      salary: parseFloat(salary) || 0
    }).eq('id', id);
    
    if (profileErr) throw profileErr;
    
    // 2. If password provided, update it in Auth
    if (password && password.trim() !== '') {
      const { error: passErr } = await supabase.auth.admin.updateUserById(id, {
        password: password
      });
      if (passErr) throw passErr;
    }
    
    // 3. Update full_name in auth metadata
    await supabase.auth.admin.updateUserById(id, { user_metadata: { full_name } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deleting from auth.users cascades to profiles usually
    const { error: delErr } = await supabase.auth.admin.deleteUser(id);
    if (delErr) throw delErr;
    
    // Just to be safe, delete from profiles
    await supabase.from('profiles').delete().eq('id', id);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
