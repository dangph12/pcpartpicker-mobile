import React from 'react';
// db: auth
// username => displayName
// email
// phone
// password
// => fire off an email to confirm the account
// ---
// db: profiles
// username
// full_name
// avatar_url (has default avatar)
const RegisterForm = () => {
  const signUpWithEmail = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      Alert.alert(error.message);
    }
    if (!session) {
      Alert.alert('Please check your email for the confirmation link');
    }
    setLoading(false);
  };

  return <div>RegisterForm</div>;
};

export default RegisterForm;
