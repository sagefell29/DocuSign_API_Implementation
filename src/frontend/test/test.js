import { useState } from 'react';
import { Flex, Heading, Box, Button, Text } from '@chakra-ui/react';

const Home = () => {
  const [templates, setTemplates] = useState([]);

  const handleGetTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendEnvelope = async (templateId) => {
    try {
      const response = await fetch('/api/send-envelope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Flex direction="column" alignItems="center">
      <Heading my={8}>DocuSign OAuth Integration</Heading>
      <Box my={4}>
        <Button colorScheme="teal" onClick={handleGetTemplates}>
          Get Templates
        </Button>
      </Box>
      {templates.length > 0 && (
        <Box my={4}>
          {templates.map((template) => (
            <Box key={template.templateId} borderWidth="1px" p={4} rounded="md">
              <Heading size="md">{template.name}</Heading>
              <Text>{template.description}</Text>
              <Box mt={4}>
                <Button colorScheme="green" onClick={() => handleSendEnvelope(template.templateId)}>
                  Send Envelope
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  );
};

export default Home;