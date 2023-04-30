import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import React, { useState } from "react";
import handleAuthClick from "../backend/handleAuth";
import getTemplates from "../backend/getTemplates";

const Page = () => {
  const [templates, setTemplates] = useState([]);

  const handleButtonClick = async () => {
    // Authenticate with DocuSign to get an access token
    const accessToken = await handleAuthClick();

    // Retrieve the list of templates
    const templateList = await getTemplates(accessToken);

    // Set the templates state
    setTemplates(templateList);
  };

  return (
    <Stack gap={5} m={5} alignItems="center">
      <Heading>Cobalt Test App</Heading>
      <Box>
        <Button onClick={handleButtonClick}>Docusign Authorization</Button>
      </Box>
      {templates.length > 0 &&
        templates.map((template) => (
          <Box key={template.templateId}>
            <Heading size="md">{template.name}</Heading>
            <Button>Send Template</Button>
          </Box>
        ))}
    </Stack>
  );
};

export default Page;