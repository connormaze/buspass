import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'parents', name: 'For Parents' },
    { id: 'schools', name: 'For Schools' },
    { id: 'drivers', name: 'For Bus Drivers' },
    { id: 'troubleshooting', name: 'Troubleshooting' },
  ];

  const resources = [
    {
      id: 1,
      title: 'Getting Started with Buspass',
      category: 'getting-started',
      description: 'Learn the basics of setting up and using Buspass.',
      icon: '🚀',
      link: '/help/getting-started',
    },
    {
      id: 2,
      title: 'Parent Guide',
      category: 'parents',
      description: 'Track your child\'s bus, manage pickup preferences, and more.',
      icon: '👨‍👩‍👧‍👦',
      link: '/help/parent-guide',
    },
    {
      id: 3,
      title: 'School Administrator Guide',
      category: 'schools',
      description: 'Manage routes, students, and school dismissal processes.',
      icon: '🏫',
      link: '/help/school-guide',
    },
    {
      id: 4,
      title: 'Bus Driver Guide',
      category: 'drivers',
      description: 'Navigate routes, manage student check-ins, and handle communications.',
      icon: '🚌',
      link: '/help/driver-guide',
    },
    {
      id: 5,
      title: 'Route Management',
      category: 'schools',
      description: 'Set up and optimize bus routes for your school.',
      icon: '🗺️',
      link: '/help/route-management',
    },
    {
      id: 6,
      title: 'Student Safety Features',
      category: 'parents',
      description: 'Learn about our safety features and notifications.',
      icon: '🛡️',
      link: '/help/safety-features',
    },
    {
      id: 7,
      title: 'Common Issues & Solutions',
      category: 'troubleshooting',
      description: 'Quick fixes for common problems.',
      icon: '🔧',
      link: '/help/troubleshooting',
    },
    {
      id: 8,
      title: 'Mobile App Guide',
      category: 'getting-started',
      description: 'How to use the Buspass mobile app effectively.',
      icon: '📱',
      link: '/help/mobile-app',
    },
    {
      id: 9,
      title: 'Working Documentation',
      category: 'getting-started',
      description: 'Technical documentation and implementation guides.',
      icon: '📚',
      link: '/help/working-docs',
    },
    {
      id: 10,
      title: 'Communication Guide',
      category: 'parents',
      description: 'Learn how to communicate with drivers and school staff.',
      icon: '💬',
      link: '/help/communication',
    },
    {
      id: 11,
      title: 'Frequently Asked Questions',
      category: 'troubleshooting',
      description: 'Find answers to common questions about Buspass.',
      icon: '❓',
      link: '/help/faq',
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header />
      <Container>
        <HeroSection>
          <HeroContent>
            <Title>Help Center</Title>
            <Subtitle>Find answers and learn how to make the most of Buspass</Subtitle>
            <SearchBar>
              <SearchInput
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBar>
          </HeroContent>
        </HeroSection>

        <Section>
          <ContentWrapper>
            <Categories>
              {categories.map(category => (
                <CategoryButton
                  key={category.id}
                  active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </CategoryButton>
              ))}
            </Categories>

            <ResourceGrid>
              {filteredResources.map(resource => (
                <ResourceCard
                  key={resource.id}
                  as={motion.div}
                  whileHover={{ y: -5 }}
                >
                  <ResourceIcon>{resource.icon}</ResourceIcon>
                  <ResourceTitle>{resource.title}</ResourceTitle>
                  <ResourceDescription>{resource.description}</ResourceDescription>
                  <ResourceLink to={resource.link}>Read More →</ResourceLink>
                </ResourceCard>
              ))}
            </ResourceGrid>

            <SupportSection>
              <SupportTitle>Need Additional Help?</SupportTitle>
              <SupportOptions>
                <SupportCard>
                  <SupportIcon>📞</SupportIcon>
                  <SupportCardTitle>Contact Support</SupportCardTitle>
                  <SupportText>
                    Our support team is available Monday through Friday, 9am-5pm EST.
                  </SupportText>
                  <SupportButton as={Link} to="/contact">Contact Us</SupportButton>
                </SupportCard>

                <SupportCard>
                  <SupportIcon>📚</SupportIcon>
                  <SupportCardTitle>Documentation</SupportCardTitle>
                  <SupportText>
                    Browse our detailed documentation for in-depth information.
                  </SupportText>
                  <SupportButton as={Link} to="/help/working-docs">View Docs</SupportButton>
                </SupportCard>
              </SupportOptions>
            </SupportSection>
          </ContentWrapper>
        </Section>
      </Container>
      <Footer />
    </>
  );
};

const Container = styled.div`
  width: 100%;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  color: white;
  padding: 120px 20px 80px;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SearchBar = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 15px 25px;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
`;

const Section = styled.section`
  padding: 80px 20px;
  background-color: #ffffff;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Categories = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
`;

const CategoryButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: ${props => props.active ? '#3498db' : '#f0f2f5'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    background: ${props => props.active ? '#3498db' : '#e2e8f0'};
  }
`;

const ResourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const ResourceCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ResourceIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 15px;
`;

const ResourceTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #2d3748;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ResourceDescription = styled.p`
  font-size: 0.95rem;
  color: #4a5568;
  margin-bottom: 15px;
  line-height: 1.5;
  flex-grow: 1;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ResourceLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    color: #2980b9;
    transform: translateX(5px);
  }
`;

const SupportSection = styled.div`
  text-align: center;
  margin-top: 60px;
`;

const SupportTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 40px;
  color: #2d3748;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SupportOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
`;

const SupportCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const SupportIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 15px;
`;

const SupportCardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2d3748;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SupportText = styled.p`
  font-size: 0.95rem;
  color: #4a5568;
  margin-bottom: 20px;
  line-height: 1.5;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SupportButton = styled(Link)`
  display: inline-block;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border-radius: 25px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }
`;

export default HelpCenter; 