"use client";
import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import {Box, Button, Typography, TextField } from "@mui/material"

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [
    createUserWithEmailAndPassword,
    user,
    loading,
    authError
  ] = useCreateUserWithEmailAndPassword(auth);

  const router = useRouter();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(email, password);
      console.log({ res });
      sessionStorage.setItem("user", true);
      setEmail("");
      setPassword("");

      // Redirect to sign-in page after successful signup
      router.push("/signin");
    } catch (e) {
      console.error(e);
    }
  };

  return (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      width: '100%',
    }}
  >
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        maxWidth: '450px',
        width: '100%',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontSize: '1.75rem',
          marginBottom: '2rem',
          textAlign: 'center',
          fontWeight: 700,
          color: '#2d3748',
        }}
      >
        Create an account
      </Typography>
      
      <Box component="form" onSubmit={handleSignUp} sx={{ display: 'flex', flexDirection: 'column' }}>
        <TextField
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{
            marginBottom: '1rem',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              background: '#f7f9fc',
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              },
            },
            '& input': {
              padding: '14px 16px',
            },
          }}
        />
        
        <TextField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={{
            marginBottom: '1.5rem',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              background: '#f7f9fc',
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              },
            },
            '& input': {
              padding: '14px 16px',
            },
          }}
        />
        
        <Button
          type="submit"
          sx={{
            padding: '0.875rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
            },
          }}
        >
          Sign Up
        </Button>
        
        <Typography
          sx={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#4a5568',
          }}
        >
          Already have an account?
        </Typography>
        
        <Typography
          onClick={() => router.push("/signin")}
          sx={{
            cursor: 'pointer',
            color: '#667eea',
            textDecoration: 'underline',
            fontSize: '0.95rem',
            textAlign: 'center',
            fontWeight: 500,
            '&:hover': {
              color: '#764ba2',
            },
          }}
        >
          Sign In
        </Typography>
      </Box>
      
      {loading && (
        <Typography sx={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.95rem', color: '#4a5568' }}>
          Loading...
        </Typography>
      )}
      {error && (
        <Typography sx={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.95rem', color: '#e53e3e' }}>
          Error: {error}
        </Typography>
      )}
      {authError && (
        <Typography sx={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.95rem', color: '#e53e3e' }}>
          Error: {authError.message}
        </Typography>
      )}
    </Box>
  </Box>
);
};

export default SignUp;
