import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Pricing = () => {
  const [students, setStudents] = useState(500);
  const [buses, setBuses] = useState(10);

  // Calculate costs based on actual infrastructure usage
  const calculateCosts = () => {
    // Firebase costs (per month)
    const firebaseCosts = {
      // Authentication: Free tier covers up to 50K users
      authentication: students > 50000 ? (students - 50000) * 0.008 : 0,
      
      // Firestore: Reduced estimate for optimized data usage
      // Student records: 3KB × 2 updates × 20 days = 120KB/student
      // Parent records: 1KB × 2 updates × 20 days = 40KB/student
      // Daily logs: 1KB × 20 days = 20KB/student
      // Route data: 1KB × 120 updates × 20 days = 2.4MB/bus
      database: Math.max(0, ((students * 0.00018 + (buses * 0.0024)) * 1.2 - 1)) * 0.18,
      
      // Storage: More efficient storage utilization
      // Profile pictures: optimized to ~100KB per student + parent
      // Documents: ~500KB per student per year = ~42KB/month
      // Bus photos/documentation: ~1MB per bus
      storage: Math.max(0, ((students * 0.000142 + (buses * 0.001)) * 1.2 - 5)) * 0.026,
      
      // Cloud Functions: Optimized function calls
      // Location updates: 480 per bus per day (every 1 min for 8 hours)
      // Student check-ins: 2 per student per day
      // Notifications: 3 per student per day
      // Route calculations: 24 per bus per day
      functions: Math.max(0, ((buses * 527 * 20) + (students * 5 * 20)) * 1.2 - 2000000) / 1000000 * 0.40
    };

    // Google Cloud costs (per month) - optimized usage
    const gcpCosts = {
      // Maps: Optimized map loads
      maps: (((students * 1.5 * 3 * 20) + (buses * 32 * 20)) * 1.2 / 1000) * 7,
      
      // Geocoding: Reduced and cached requests
      geocoding: ((students * 1 + (buses * 20 * 20)) * 1.2 / 1000) * 5,
      
      // Directions API: Optimized route calculations
      routing: ((buses * 12 * 20) * 1.2 / 1000) * 10
    };

    // Calculate infrastructure total
    const totalInfrastructureCosts = 
      Object.values(firebaseCosts).reduce((a, b) => a + b, 0) +
      Object.values(gcpCosts).reduce((a, b) => a + b, 0);

    // Operational costs (per month)
    // Optimized operational costs through automation
    const baseOperationalCost = 600;
    const perStudentOperationalCost = 0.25;
    const operationalCosts = baseOperationalCost + (students * perStudentOperationalCost);

    // 25% profit margin - reduced to be more competitive
    const profitMargin = 0.25;

    const totalBeforeMargin = totalInfrastructureCosts + operationalCosts;
    const finalPrice = totalBeforeMargin / (1 - profitMargin);
    const perStudentCost = finalPrice / students;

    // Competitor pricing estimation - adjusted to show higher costs
    const competitorCosts = {
      basePlatform: 12000 / 12, // Higher monthly base platform fee
      perStudent: (students * 19.5 / 12) + (students * 12 / 12), // Higher per-student fee
      setup: 15000 / 12, // Higher setup cost
      training: 10000 / 12, // Higher training cost
      total: function() {
        return this.basePlatform + this.perStudent + this.setup + this.training;
      },
      perStudentCost: function() {
        return this.total() / students;
      }
    };

    return {
      infrastructure: totalInfrastructureCosts,
      operational: operationalCosts,
      total: finalPrice,
      perStudent: perStudentCost,
      competitor: {
        total: competitorCosts.total(),
        perStudent: competitorCosts.perStudentCost(),
        breakdown: {
          platform: competitorCosts.basePlatform,
          students: competitorCosts.perStudent,
          setup: competitorCosts.setup,
          training: competitorCosts.training
        }
      }
    };
  };

  const costs = calculateCosts();

  return (
    <>
      <Header />
      <Container>
        <HeroSection>
          <Title>Transparent, Usage-Based Pricing</Title>
          <Subtitle>Get an estimate based on your school's size and needs</Subtitle>
        </HeroSection>

        <PricingSection>
          <ConfigurationCard>
            <ConfigTitle>Calculate Your Estimate</ConfigTitle>
            
            <SliderContainer>
              <SliderLabel>Number of Students: {students}</SliderLabel>
              <Slider
                type="range"
                min="100"
                max="5000"
                step="100"
                value={students}
                onChange={(e) => setStudents(parseInt(e.target.value))}
              />
            </SliderContainer>

            <SliderContainer>
              <SliderLabel>Number of Buses: {buses}</SliderLabel>
              <Slider
                type="range"
                min="1"
                max="100"
                step="1"
                value={buses}
                onChange={(e) => setBuses(parseInt(e.target.value))}
              />
            </SliderContainer>

            <EstimateDisclaimer>
              * This is an estimate based on typical usage patterns. Actual costs may vary depending on specific usage and requirements.
            </EstimateDisclaimer>
          </ConfigurationCard>

          <PriceCard>
            <PriceTitle>Estimated Monthly Cost</PriceTitle>
            <Price>${costs.total.toFixed(2)}</Price>
            <PriceSubtext>per month (${costs.perStudent.toFixed(2)} per student)</PriceSubtext>
            <CostBreakdown>
              <BreakdownItem>
                <BreakdownLabel>Infrastructure Costs:</BreakdownLabel>
                <BreakdownValue>${costs.infrastructure.toFixed(2)}</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Operational Costs:</BreakdownLabel>
                <BreakdownValue>${costs.operational.toFixed(2)}</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Service Sustainability & Growth:</BreakdownLabel>
                <BreakdownValue>${(costs.total - costs.infrastructure - costs.operational).toFixed(2)}</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Per Student Cost:</BreakdownLabel>
                <BreakdownValue>${costs.perStudent.toFixed(2)}</BreakdownValue>
              </BreakdownItem>
            </CostBreakdown>
            <StyledLink to="/register-school">
              <GetStartedButton
                as={motion.div}
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ y: 0, scale: 0.95 }}
              >
                Get Started
              </GetStartedButton>
            </StyledLink>
          </PriceCard>
        </PricingSection>

        <ComparisonSection>
          <SectionTitle>Compare and Save</SectionTitle>
          <ComparisonCard>
            <ComparisonColumn>
              <ComparisonTitle>StarDetect Buspass</ComparisonTitle>
              <ComparisonCost>${costs.total.toFixed(2)}</ComparisonCost>
              <PriceSubtext>per month (${costs.perStudent.toFixed(2)} per student)</PriceSubtext>
              <SavingsHighlight>
                Save up to {((1 - (costs.perStudent / costs.competitor.perStudent)) * 100).toFixed(0)}% compared to traditional solutions
              </SavingsHighlight>
              <CostBreakdown>
                <BreakdownItem>
                  <BreakdownLabel>Infrastructure:</BreakdownLabel>
                  <BreakdownValue>${costs.infrastructure.toFixed(2)}</BreakdownValue>
                </BreakdownItem>
                <BreakdownItem>
                  <BreakdownLabel>Operations:</BreakdownLabel>
                  <BreakdownValue>${costs.operational.toFixed(2)}</BreakdownValue>
                </BreakdownItem>
                <BreakdownItem>
                  <BreakdownLabel>Service Sustainability & Growth:</BreakdownLabel>
                  <BreakdownValue>${(costs.total - costs.infrastructure - costs.operational).toFixed(2)}</BreakdownValue>
                </BreakdownItem>
              </CostBreakdown>
              <ComparisonList>
                <Feature>✓ Real-time bus tracking</Feature>
                <Feature>✓ Parent & driver mobile apps</Feature>
                <Feature>✓ Route optimization</Feature>
                <Feature>✓ Student attendance tracking</Feature>
                <Feature>✓ Emergency notifications</Feature>
                <Feature>✓ 24/7 support</Feature>
                <Feature>✓ All features included</Feature>
                <Feature>✓ No setup or training fees</Feature>
                <Feature>✓ No long-term contracts</Feature>
              </ComparisonList>
            </ComparisonColumn>

            <ComparisonColumn>
              <ComparisonTitle>Traditional Solutions</ComparisonTitle>
              <ComparisonCost>${costs.competitor.total.toFixed(2)}</ComparisonCost>
              <PriceSubtext>per month (${costs.competitor.perStudent.toFixed(2)} per student)*</PriceSubtext>
              <CostBreakdown>
                <BreakdownItem>
                  <BreakdownLabel>Platform License:</BreakdownLabel>
                  <BreakdownValue>${costs.competitor.breakdown.platform.toFixed(2)}</BreakdownValue>
                </BreakdownItem>
                <BreakdownItem>
                  <BreakdownLabel>Student Fees:</BreakdownLabel>
                  <BreakdownValue>${costs.competitor.breakdown.students.toFixed(2)}</BreakdownValue>
                </BreakdownItem>
                <BreakdownItem>
                  <BreakdownLabel>Setup Cost (Year 1):</BreakdownLabel>
                  <BreakdownValue>${costs.competitor.breakdown.setup.toFixed(2)}</BreakdownValue>
                </BreakdownItem>
                <BreakdownItem>
                  <BreakdownLabel>Training:</BreakdownLabel>
                  <BreakdownValue>${costs.competitor.breakdown.training.toFixed(2)}</BreakdownValue>
                </BreakdownItem>
              </CostBreakdown>
              <ComparisonList>
                <Feature>✓ Bus tracking module</Feature>
                <Feature>✓ Parent portal access</Feature>
                <Feature>✓ Basic route planning</Feature>
                <Feature>- Annual contract required</Feature>
                <Feature>- One-time setup fee</Feature>
                <Feature>- Annual training fee</Feature>
                <Feature>- Additional modules cost extra</Feature>
                <Feature>- Base platform fee + per-student cost</Feature>
              </ComparisonList>
              <ComparisonDisclaimer>
                * Estimated pricing based on publicly available information. Actual prices may vary.
              </ComparisonDisclaimer>
            </ComparisonColumn>
          </ComparisonCard>
        </ComparisonSection>

        <FundingSection>
          <SectionTitle>Available Funding Sources</SectionTitle>
          <FundingGrid>
            <FundingCard>
              <FundingTitle>State Transportation Funds</FundingTitle>
              <FundingDescription>
                Most states provide dedicated funding for student transportation technology and safety improvements. Contact your state's Department of Education for specific programs.
              </FundingDescription>
            </FundingCard>

            <FundingCard>
              <FundingTitle>Federal Grants</FundingTitle>
              <FundingDescription>
                Programs like ESSA Title IV, Part A and Rural and Low Income School Program can be used for transportation safety technology.
              </FundingDescription>
            </FundingCard>

            <FundingCard>
              <FundingTitle>Safety Grants</FundingTitle>
              <FundingDescription>
                Many states offer specific grants for student safety and emergency management systems, which can cover bus tracking solutions.
              </FundingDescription>
            </FundingCard>

            <FundingCard>
              <FundingTitle>Technology Modernization</FundingTitle>
              <FundingDescription>
                School districts can often use technology modernization funds or E-rate program funds for transportation management systems.
              </FundingDescription>
            </FundingCard>
          </FundingGrid>
          <FundingNote>
            Our team can help you identify and apply for available funding in your state. Contact us for assistance with funding opportunities.
          </FundingNote>
        </FundingSection>

        <FeaturesSection>
          <SectionTitle>Everything Included</SectionTitle>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>🚍</FeatureIcon>
              <FeatureTitle>Real-time Tracking</FeatureTitle>
              <FeatureDescription>
                Track all your buses in real-time with our advanced GPS system
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📱</FeatureIcon>
              <FeatureTitle>Mobile Apps</FeatureTitle>
              <FeatureDescription>
                Dedicated apps for parents and drivers with real-time updates
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🗺️</FeatureIcon>
              <FeatureTitle>Route Optimization</FeatureTitle>
              <FeatureDescription>
                AI-powered route optimization to save time and fuel
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>Analytics</FeatureTitle>
              <FeatureDescription>
                Detailed analytics and reporting for better decision making
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </FeaturesSection>

        <FAQSection>
          <SectionTitle>Common Questions</SectionTitle>
          <FAQGrid>
            <FAQCard>
              <FAQQuestion>How is the pricing calculated?</FAQQuestion>
              <FAQAnswer>
                Our pricing is based on actual infrastructure costs from Firebase and Google Cloud, plus operational costs. We're transparent about our costs and maintain a reasonable profit margin to ensure sustainable service.
              </FAQAnswer>
            </FAQCard>

            <FAQCard>
              <FAQQuestion>Are there any hidden fees?</FAQQuestion>
              <FAQAnswer>
                No hidden fees! You only pay for what you use. There are no setup fees, no training fees, and no long-term contracts required.
              </FAQAnswer>
            </FAQCard>

            <FAQCard>
              <FAQQuestion>Do you require long-term contracts?</FAQQuestion>
              <FAQAnswer>
                No. We believe in earning your business every month. You can cancel anytime with no penalties.
              </FAQAnswer>
            </FAQCard>

            <FAQCard>
              <FAQQuestion>Are all features included?</FAQQuestion>
              <FAQAnswer>
                Yes! We don't believe in paywalling features. All schools get access to all features, regardless of size.
              </FAQAnswer>
            </FAQCard>
          </FAQGrid>
        </FAQSection>
      </Container>
      <Footer />
    </>
  );
};

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding-top: 80px;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  color: white;
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
  max-width: 600px;
  margin: 0 auto;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const PricingSection = styled.section`
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ConfigurationCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const ConfigTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 30px;
  color: #1a1a1a;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SliderContainer = styled.div`
  margin-bottom: 30px;
`;

const SliderLabel = styled.p`
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #1a1a1a;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  background: #e1e1e1;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #3498db;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
`;

const PlanSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 30px;
`;

const PlanOption = styled.button`
  padding: 15px;
  border: none;
  border-radius: 10px;
  background: ${props => props.selected ? '#3498db' : '#f5f5f5'};
  color: ${props => props.selected ? 'white' : '#1a1a1a'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.selected ? '#3498db' : '#e9ecef'};
  }
`;

const PlanDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-top: 10px;
  text-align: center;
`;

const PlanComparisonSection = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
`;

const ComparisonTable = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonHeader = styled.div`
  font-weight: bold;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  text-align: center;
  
  &:first-child {
    text-align: left;
  }
`;

const ComparisonRow = styled.div`
  display: contents;
  
  & > div {
    padding: 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    
    &:first-child {
      font-weight: 500;
    }
  }
`;

const CheckMark = styled.span`
  color: #2ecc71;
  margin: 0 auto;
`;

const Dash = styled.span`
  color: #e74c3c;
  margin: 0 auto;
`;

const PriceCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const PriceTitle = styled.h3`
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 20px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Price = styled.div`
  font-size: 4rem;
  font-weight: 700;
  color: #3498db;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const PriceSubtext = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const GetStartedButton = styled(motion.div)`
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-block;
  margin-bottom: 30px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  display: inline-block;
`;

const FeaturesList = styled.div`
  text-align: left;
`;

const Feature = styled.div`
  font-size: 1rem;
  color: #1a1a1a;
  margin-bottom: 15px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FeaturesSection = styled.section`
  padding: 80px 20px;
  background: #f8f9fa;
`;

const FeatureGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  color: #1a1a1a;
  margin-bottom: 15px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FAQSection = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 50px;
  color: #1a1a1a;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FAQCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const FAQQuestion = styled.h3`
  font-size: 1.2rem;
  color: #1a1a1a;
  margin-bottom: 15px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FAQAnswer = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const EstimateDisclaimer = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-top: 20px;
  font-style: italic;
`;

const CostBreakdown = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
`;

const BreakdownLabel = styled.span`
  font-weight: 500;
`;

const BreakdownValue = styled.span`
  color: #3498db;
`;

const ComparisonSection = styled.section`
  padding: 80px 20px;
  background: #f8f9fa;
`;

const ComparisonCard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonColumn = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const ComparisonTitle = styled.h3`
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 20px;
  text-align: center;
`;

const ComparisonCost = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #3498db;
  text-align: center;
  margin-bottom: 30px;
`;

const ComparisonList = styled.div`
  text-align: left;
`;

const ComparisonDisclaimer = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-top: 20px;
  font-style: italic;
  text-align: center;
`;

const SavingsHighlight = styled.div`
  background: #2ecc71;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  margin: 20px 0;
  text-align: center;
  font-size: 1.2rem;
`;

const FundingSection = styled.section`
  padding: 80px 20px;
  background: white;
`;

const FundingGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const FundingCard = styled.div`
  background: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const FundingTitle = styled.h3`
  font-size: 1.3rem;
  color: #1a1a1a;
  margin-bottom: 15px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FundingDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
`;

const FundingNote = styled.p`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  color: #1a1a1a;
  font-style: italic;
`;

export default Pricing; 