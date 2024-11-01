import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text, Button } from 'design-system/components';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Flex
      style={{ 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'background.primary',
      }}
    >
      <Box 
        display="flex"
        flexDirection="column"
        alignItems="center"
        maxWidth="400px"
        width="100%"
        p={6}
      >
        <Text
          as="h1"
          variants={['title']}
          mb={2}
          color="text.primary"
        >
          Playforward
        </Text>
        
        <Text
          color="text.secondary"
          mb={4}
        >
          A tiny music player for TTRPGs
        </Text>

        <Flex
          gap={2}
          width="100%"
          mb={4}
          justifyContent="center"
          alignItems="center"
        >
          <Button
            variants={['primary', 'medium']}
            onClick={() => navigate('/player')}
          >
            Launch
          </Button>
          
          <Button
            variants={['primary', 'medium']}
            onClick={() => navigate('/settings')}
          >
            Settings
          </Button>
        </Flex>
      </Box>

      <Box mt="auto" p={4}>
        <Text color="text.secondary" fontSize="sm">
          Created by{' '}
          <Text
            variants={['link']}
            href="https://inner-space.fedor-ryzhenkov.com"
          >
            Fedor Ryzhenkov
          </Text>
        </Text>
      </Box>
    </Flex>
  );
};

export default Welcome;