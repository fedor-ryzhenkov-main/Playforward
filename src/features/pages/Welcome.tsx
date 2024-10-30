import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text, Button } from 'design-system/components';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="background.primary"
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
          variant="title"
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
        >
          <Button
            variant="secondary"
            onClick={() => navigate('/player')}
            fullWidth
          >
            Launch
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/settings')}
            fullWidth
          >
            Settings
          </Button>
        </Flex>
      </Box>

      <Box mt="auto" p={4}>
        <Text color="text.secondary" fontSize="sm">
          Created by{' '}
          <Text
            as="a"
            href="https://inner-space.fedor-ryzhenkov.com"
            target="_blank"
            rel="noopener noreferrer"
            color="text.accent"
            style={{ textDecoration: 'none' }}
          >
            Fedor Ryzhenkov
          </Text>
        </Text>
      </Box>
    </Flex>
  );
};

export default Welcome;