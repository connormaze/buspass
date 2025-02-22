import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function FAQ() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What are the minimum system requirements?",
      answer: "The minimum requirements include a modern web browser (Chrome, Firefox, Safari, Edge), reliable internet connection (10+ Mbps), and sufficient storage for data management. For mobile devices, iOS 12+ or Android 8+ is recommended."
    },
    {
      question: "How long does a typical implementation take?",
      answer: "A typical implementation takes 2-4 weeks, depending on the size of the school and complexity of routes. This includes initial setup, data migration, user training, and testing phases."
    },
    {
      question: "Can we import existing transportation data?",
      answer: "Yes, Buspass supports importing data from various formats including CSV, Excel, and JSON. We provide tools and guidance for migrating student information, route data, and user accounts."
    },
    {
      question: "How is user training handled?",
      answer: "We provide comprehensive training materials including video tutorials, documentation, and live training sessions. Additionally, we offer dedicated support during the implementation phase."
    },
    {
      question: "What security measures are in place?",
      answer: "Buspass implements multiple security layers including end-to-end encryption, role-based access control, two-factor authentication, and regular security audits. All data is encrypted both in transit and at rest."
    },
    {
      question: "How do we handle route optimization?",
      answer: "The route optimization system uses advanced algorithms to consider factors like student locations, traffic patterns, and time constraints. You can manually adjust routes or use the automated optimization tools."
    },
    {
      question: "What kind of support is available during implementation?",
      answer: "We provide dedicated implementation support including technical assistance, configuration guidance, and best practices consultation. Support is available via email, phone, and video conferencing."
    },
    {
      question: "Can we customize the system to our needs?",
      answer: "Yes, Buspass offers various customization options including custom fields, notification settings, reporting templates, and role-based permissions to match your specific requirements."
    },
    {
      question: "How is data backup handled?",
      answer: "Data is automatically backed up daily with point-in-time recovery options. You can also manually export data and configure backup frequency based on your needs."
    },
    {
      question: "What happens if we need to scale the system?",
      answer: "Buspass is designed to scale with your needs. You can add more routes, users, and features as required. The system architecture supports growing student populations and route complexity."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/help/docs/implementation')}
        sx={{ mb: 4 }}
      >
        Back to Implementation Guide
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Implementation FAQs
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography paragraph>
          Find answers to common questions about implementing Buspass in your school
          transportation system.
        </Typography>

        <Box sx={{ mt: 4 }}>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`faq-content-${index}`}
                id={`faq-header-${index}`}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Need More Help?
          </Typography>
          <Typography paragraph>
            Contact our implementation team for personalized assistance with your setup.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              href="mailto:buspass@stardetect.us"
            >
              Contact Support
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/help/docs/implementation')}
            >
              Back to Overview
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 