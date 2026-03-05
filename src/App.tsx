import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/hooks/useAuth";
import "@/i18n";

const Index = lazy(() => import("./pages/Index"));
const CreditCalculator = lazy(() => import("./pages/CreditCalculator"));
const Showcase = lazy(() => import("./pages/Showcase"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Glossary = lazy(() => import("./pages/Glossary"));
const Faq = lazy(() => import("./pages/FAQ"));
const Partners = lazy(() => import("./pages/Partners"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Compare = lazy(() => import("./pages/Compare"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const SharedCalculation = lazy(() => import("./pages/SharedCalculation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EmbedBuilder = lazy(() => import("./pages/EmbedBuilder"));
const EmbedWidgets = lazy(() => import("./pages/EmbedWidgets"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const CalcBuilder = lazy(() => import("./pages/CalcBuilder"));
const CalcList = lazy(() => import("./pages/CalcList"));
const CalcPlayer = lazy(() => import("./pages/CalcPlayer"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CalcLanding = lazy(() => import("./pages/CalcLanding"));
const HelpIndex = lazy(() => import("./pages/help/HelpIndex"));
const HelpGettingStarted = lazy(() => import("./pages/help/HelpGettingStarted"));
const HelpFormula = lazy(() => import("./pages/help/HelpFormula"));
const HelpFields = lazy(() => import("./pages/help/HelpFields"));
const HelpPages = lazy(() => import("./pages/help/HelpPages"));
const HelpLogic = lazy(() => import("./pages/help/HelpLogic"));
const HelpExamples = lazy(() => import("./pages/help/HelpExamples"));
const ExamplesIndex = lazy(() => import("./pages/examples/ExamplesIndex"));
const ExamplesCategory = lazy(() => import("./pages/examples/ExamplesCategory"));
const ExamplesCalc = lazy(() => import("./pages/examples/ExamplesCalc"));

// Calculator pages
const VatCalculator = lazy(() => import("./pages/calculators/VatCalculator"));
const NdflCalculator = lazy(() => import("./pages/calculators/NdflCalculator"));
const PeniCalculator = lazy(() => import("./pages/calculators/PeniCalculator"));
const Gk395Calculator = lazy(() => import("./pages/calculators/Gk395Calculator"));
const PenaltyContractCalculator = lazy(() => import("./pages/calculators/PenaltyContractCalculator"));
const PenaltyDduCalculator = lazy(() => import("./pages/calculators/PenaltyDduCalculator"));
const PropertyDeductionCalculator = lazy(() => import("./pages/calculators/PropertyDeductionCalculator"));
const PropertySaleTaxCalculator = lazy(() => import("./pages/calculators/PropertySaleTaxCalculator"));
const MortgageCalculator = lazy(() => import("./pages/calculators/MortgageCalculator"));
const CreditEarlyRepaymentCalculator = lazy(() => import("./pages/calculators/CreditEarlyRepaymentCalculator"));
const RefinancingCalculator = lazy(() => import("./pages/calculators/RefinancingCalculator"));
const MicroloanCalculator = lazy(() => import("./pages/calculators/MicroloanCalculator"));
const InflationCalculator = lazy(() => import("./pages/calculators/InflationCalculator"));
const LoanInterestCalculator = lazy(() => import("./pages/calculators/LoanInterestCalculator"));
const OsagoCalculator = lazy(() => import("./pages/calculators/OsagoCalculator"));
const TransportTaxCalculator = lazy(() => import("./pages/calculators/TransportTaxCalculator"));
const RastamozhkaCalculator = lazy(() => import("./pages/calculators/RastamozhkaCalculator"));
const AutoLoanCalculator = lazy(() => import("./pages/calculators/AutoLoanCalculator"));
const FuelConsumptionCalculator = lazy(() => import("./pages/calculators/FuelConsumptionCalculator"));
const OtpusknyeCalculator = lazy(() => import("./pages/calculators/OtpusknyeCalculator"));
const UnusedVacationCalculator = lazy(() => import("./pages/calculators/UnusedVacationCalculator"));
const InsuranceTenureCalculator = lazy(() => import("./pages/calculators/InsuranceTenureCalculator"));
const SubsistenceMinimumCalculator = lazy(() => import("./pages/calculators/SubsistenceMinimumCalculator"));
const AlimonyIndexationCalculator = lazy(() => import("./pages/calculators/AlimonyIndexationCalculator"));
const DepositCalculator = lazy(() => import("./pages/calculators/DepositCalculator"));

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
}

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/credit-calculator" element={<CreditCalculator />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/glossary" element={<Glossary />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/showcase" element={<Showcase />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/:categoryId" element={<CategoryDetail />} />
                  <Route path="/shared/:token" element={<SharedCalculation />} />
                  {/* Calculator pages */}
                  <Route path="/vat" element={<VatCalculator />} />
                  <Route path="/ndfl" element={<NdflCalculator />} />
                  <Route path="/peni" element={<PeniCalculator />} />
                  <Route path="/gk395" element={<Gk395Calculator />} />
                  <Route path="/penalty-contract" element={<PenaltyContractCalculator />} />
                  <Route path="/penalty-ddu" element={<PenaltyDduCalculator />} />
                  <Route path="/property-deduction" element={<PropertyDeductionCalculator />} />
                  <Route path="/property-sale-tax" element={<PropertySaleTaxCalculator />} />
                  <Route path="/mortgage" element={<MortgageCalculator />} />
                  <Route path="/credit-early-repayment" element={<CreditEarlyRepaymentCalculator />} />
                  <Route path="/refinancing" element={<RefinancingCalculator />} />
                  <Route path="/microloan" element={<MicroloanCalculator />} />
                  <Route path="/inflation" element={<InflationCalculator />} />
                  <Route path="/loan-interest" element={<LoanInterestCalculator />} />
                  <Route path="/osago" element={<OsagoCalculator />} />
                  <Route path="/transport-tax" element={<TransportTaxCalculator />} />
                  <Route path="/rastamozhka-auto" element={<RastamozhkaCalculator />} />
                  <Route path="/auto-loan" element={<AutoLoanCalculator />} />
                  <Route path="/fuel-consumption" element={<FuelConsumptionCalculator />} />
                  <Route path="/otpusknye" element={<OtpusknyeCalculator />} />
                  <Route path="/unused-vacation" element={<UnusedVacationCalculator />} />
                  <Route path="/insurance-tenure" element={<InsuranceTenureCalculator />} />
                  <Route path="/subsistence-minimum" element={<SubsistenceMinimumCalculator />} />
                  <Route path="/alimony-indexation" element={<AlimonyIndexationCalculator />} />
                  <Route path="/deposit" element={<DepositCalculator />} />
                  <Route path="/embed-builder" element={<EmbedBuilder />} />
                  <Route path="/embed-widgets" element={<EmbedWidgets />} />
                  <Route path="/api-keys" element={<ApiKeys />} />
                  <Route path="/calc-list" element={<CalcList />} />
                  <Route path="/calc-builder" element={<CalcBuilder />} />
                  <Route path="/calc-builder/:id" element={<CalcBuilder />} />
                  <Route path="/c/:slug" element={<CalcPlayer />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/calc-landing" element={<CalcLanding />} />
                  <Route path="/help" element={<HelpIndex />} />
                  <Route path="/help/getting-started" element={<HelpGettingStarted />} />
                  <Route path="/help/formula" element={<HelpFormula />} />
                  <Route path="/help/fields" element={<HelpFields />} />
                  <Route path="/help/pages" element={<HelpPages />} />
                  <Route path="/help/logic" element={<HelpLogic />} />
                  <Route path="/help/examples" element={<HelpExamples />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
