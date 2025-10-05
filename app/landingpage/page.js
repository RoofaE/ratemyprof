"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {Box, Button, Typography} from "@mui/material"
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    sessionStorage.removeItem('user');
    router.push('/signin');
  };

  return (
  <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    sx={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Navbar */}
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 10,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#f5f5f5',
        }}
      >
        Rate My Professor
      </Typography>
      <Button
        onClick={() => router.push("/signup")}
        sx={{
          fontSize: '1rem',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          background: '#5cc79e',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            background: '#73c59f',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        Get Started
      </Button>
    </Box>

    {/* Landing Content */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flex: 1,
        paddingTop: '4rem',
        animation: 'fadeInUp 1s ease-in-out',
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '4rem',
          marginBottom: '1rem',
          color: '#ffffff',
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          fontWeight: 700,
          animation: 'fadeInDown 1s ease-in-out',
          '@keyframes fadeInDown': {
            from: {
              opacity: 0,
              transform: 'translateY(-40px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
          '@media (max-width: 768px)': {
            fontSize: '2.5rem',
          },
        }}
      >
        Welcome to AI Rate My Professor
      </Typography>
      <Typography
        sx={{
          fontSize: '1.5rem',
          color: '#ffffff',
          maxWidth: '600px',
          margin: '0 auto',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          '@media (max-width: 768px)': {
            fontSize: '1.2rem',
          },
        }}
      >
        Your reliable AI Chat Assistant
      </Typography>
    </Box>
  </Box>
);
};

export default LandingPage;
