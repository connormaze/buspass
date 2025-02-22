import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const HelpArticle = ({ title, lastUpdated, content, relatedArticles }) => {
  return (
    <>
      <Header />
      <Container>
        <ArticleWrapper>
          <Breadcrumb>
            <BreadcrumbLink to="/help">Help Center</BreadcrumbLink> / {title}
          </Breadcrumb>
          
          <ArticleHeader>
            <Title>{title}</Title>
            {lastUpdated && (
              <LastUpdated>Last updated: {lastUpdated}</LastUpdated>
            )}
          </ArticleHeader>

          <ArticleContent>
            {content}
          </ArticleContent>

          {relatedArticles && relatedArticles.length > 0 && (
            <RelatedSection>
              <RelatedTitle>Related Articles</RelatedTitle>
              <RelatedGrid>
                {relatedArticles.map((article, index) => (
                  <RelatedCard key={index} to={article.link}>
                    <RelatedCardTitle>{article.title}</RelatedCardTitle>
                    <RelatedCardDescription>{article.description}</RelatedCardDescription>
                  </RelatedCard>
                ))}
              </RelatedGrid>
            </RelatedSection>
          )}

          <HelpfulSection>
            <HelpfulText>Was this article helpful?</HelpfulText>
            <HelpfulButtons>
              <HelpfulButton>👍 Yes</HelpfulButton>
              <HelpfulButton>👎 No</HelpfulButton>
            </HelpfulButtons>
            <ContactSupport>
              Still need help? <SupportLink to="/contact">Contact Support</SupportLink>
            </ContactSupport>
          </HelpfulSection>
        </ArticleWrapper>
      </Container>
      <Footer />
    </>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 40px 20px;
`;

const ArticleWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Breadcrumb = styled.div`
  margin-bottom: 30px;
  color: #4a5568;
  font-size: 0.9rem;
`;

const BreadcrumbLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ArticleHeader = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LastUpdated = styled.div`
  color: #718096;
  font-size: 0.9rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ArticleContent = styled.div`
  color: #2d3748;
  line-height: 1.7;
  font-size: 1.1rem;
  margin-bottom: 40px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 40px 0 20px;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  h3 {
    font-size: 1.4rem;
    font-weight: 600;
    margin: 30px 0 15px;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  p {
    margin-bottom: 20px;
  }

  ul, ol {
    margin: 20px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 10px;
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 20px 0;
  }

  code {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', monospace;
  }

  blockquote {
    border-left: 4px solid #3498db;
    padding-left: 20px;
    margin: 20px 0;
    color: #4a5568;
    font-style: italic;
  }
`;

const RelatedSection = styled.div`
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e2e8f0;
`;

const RelatedTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2d3748;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const RelatedCard = styled(Link)`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: #edf2f7;
  }
`;

const RelatedCardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const RelatedCardDescription = styled.p`
  font-size: 0.9rem;
  color: #4a5568;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const HelpfulSection = styled.div`
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
`;

const HelpfulText = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2d3748;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const HelpfulButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
`;

const HelpfulButton = styled.button`
  padding: 10px 25px;
  border: 1px solid #e2e8f0;
  border-radius: 25px;
  background: white;
  color: #4a5568;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    background: #f8f9fa;
    transform: translateY(-2px);
  }
`;

const ContactSupport = styled.div`
  color: #4a5568;
  font-size: 0.95rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SupportLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export default HelpArticle; 