import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { OffersSection } from '@/components/home/OffersSection';
import { BestSellersSection } from '@/components/home/BestSellersSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategoriesSection />
      <OffersSection />
      <BestSellersSection />
    </Layout>
  );
};

export default Index;
