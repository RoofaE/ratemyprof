"use client"
import Image from "next/image";
import { useState, useEffect } from "react"; 
import {Box, Stack, TextField, Button, Typography, IconButton} from "@mui/material"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/app/firebase/config"
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import SendIcon from '@mui/icons-material/Send';


export default function Home() {
  const [messages, setMessages] = useState([
    {
      "role": "assistant",
      "content": "Hello, I am the Rate My Professor support assistant. How can I help you today?"
    }
  ])

  const [message, setMessage] = useState("")
  const sendMessage = async () => {
    setMessages((messages)=>[
      ...messages, //put the previous messages, then add a new one
      {role: "user", content: message},
      {role: "assistant", content: ""},
    ])
    setMessage("")

    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify([...messages, {role: "user", content: message}])
    }).then(async(res)=>{
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      let result = ""
      return reader.read().then(function processText({done, value}){
        if (done){
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), {stream: true})
        //makes sure yout variables behave as expected
        setMessages((messages)=>{
          let lastMessage = messages[messages.length -1]
          let otherMessages = messages.slice(0, messages.length -1)
          return[
            //return previous messages
            ...otherMessages,
            {...lastMessage, content: lastMessage.content + text},
          ]
        })
        return reader.read().then(processText) // call the function -recursive
      })
    })
  }

  const [user] = useAuthState(auth);
  const router = useRouter();
  const [userSession, setUserSession] = useState("user");
  const [loadingTime, setLoading] = useState(false);

  // check if user is authenticated
  if (!user && !userSession) {
    router.push("/landingpage")
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserSession(sessionStorage.getItem("user"));
    }
  }, []);

  return (
  <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    sx={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}
  >
    {/* Header */}
    <Box
      width="100%"
      py={2.5}
      px={4}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'white', 
          fontWeight: 600,
          letterSpacing: '-0.3px'
        }}
      >
        Rate My Professor AI
      </Typography>
      <Button 
        variant="outlined"
        onClick={() => router.push("/landingpage")}
        sx={{
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          fontWeight: 500,
          px: 3,
          py: 0.75,
          borderRadius: 10,
          textTransform: 'none',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        Sign Out
      </Button>
    </Box>

    {/* Chat Container */}
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex={1}
      p={2}
    >
      <Stack
        direction="column"
        width="100%"
        maxWidth="900px"
        height="85vh"
        spacing={0}
      >
        {/* Messages Area */}
        <Stack 
          direction="column" 
          spacing={2.5} 
          flexGrow={1} 
          overflow="auto"
          p={3}
          sx={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box 
              key={index} 
              display="flex" 
              justifyContent={message.role === "assistant" ? "flex-start" : "flex-end"}
              sx={{
                animation: 'fadeIn 0.3s ease-in',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Box 
                sx={{
                  bgcolor: message.role === "assistant" 
                    ? 'rgba(255, 255, 255, 0.95)' 
                    : 'rgba(118, 75, 162, 0.9)',
                  color: message.role === "assistant" ? '#2d3748' : 'white',
                  borderRadius: message.role === "assistant" 
                    ? '20px 20px 20px 4px' 
                    : '20px 20px 4px 20px',
                  p: 2.5,
                  maxWidth: "70%",
                  boxShadow: message.role === "assistant"
                    ? '0 4px 20px rgba(0, 0, 0, 0.1)'
                    : '0 4px 20px rgba(118, 75, 162, 0.3)',
                  wordWrap: 'break-word',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                  }}
                >
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '30px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              placeholder="Ask about professors, courses, or ratings..."
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && message.trim()) {
                  sendMessage();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                  background: 'transparent',
                  '& fieldset': {
                    border: 'none',
                  },
                  '& input': {
                    padding: '14px 20px',
                  },
                },
              }}
            />
            <IconButton 
              onClick={sendMessage}
              disabled={!message.trim()}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'scale(1.05)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  </Box>
);
}
