import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Container, Header, Text, Paragraph, Link, Button } from 'design-system/components';
import AppHeader from '../welcome/AppHeader';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="lg" className="min-h-screen bg-background-primary">
      <AppHeader/>
      <Flex
        direction="column"
        align="center"
        justify="center"
        className="flex-grow"
      >
        <Container size="sm" className="text-center">
          <Header level={1} className="mb-2">
            Playforward
          </Header>
          
          <Paragraph className="mb-4 text-text-secondary">
            A tiny music player for TTRPGs
          </Paragraph>

          <Flex gap="sm" justify="center" className="mb-4">
            <Button variant="primary" size="md" onClick={() => navigate('/player')}>
              Launch
            </Button>
            
            <Button variant="primary" size="md" onClick={() => navigate('/settings')}>
              Settings
            </Button>
          </Flex>
        </Container>

        <Container className="mt-auto p-4 text-center">
          <Text className="text-text-secondary">
            Created by{' '}
            <Link href="https://inner-space.fedor-ryzhenkov.com" external>
              Fedor Ryzhenkov
            </Link>
          </Text>
        </Container>
        </Flex>
    </Flex>
  );
};

export default Welcome;