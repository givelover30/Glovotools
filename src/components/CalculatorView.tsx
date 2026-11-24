import { lazy, Suspense } from 'react';
import { Printer, Download } from 'lucide-react';
import { CalculatorMeta, CalculatorId } from '../types.ts';
import CalculatorPageLayout from './calculator/CalculatorPageLayout.tsx';
import EngineCalculatorView from './calculator/EngineCalculatorView.tsx';
import { isNativePhase4Workspace } from './calculator/toolPageVariant.ts';
import { useTranslation } from '../i18n/I18nContext.tsx';
import ErrorBoundary from './common/ErrorBoundary.tsx';

const BasicMathCalculator = lazy(() => import('./calculators/BasicMathCalculator.tsx'));
const AlgebraCalculator = lazy(() => import('./calculators/AlgebraCalculator.tsx'));
const AreaCalculator = lazy(() => import('./calculators/AreaCalculator.tsx'));
const VolumeCalculator = lazy(() => import('./calculators/VolumeCalculator.tsx'));
const TrigCalculator = lazy(() => import('./calculators/TrigCalculator.tsx'));
const StatisticsCalculator = lazy(() => import('./calculators/StatisticsCalculator.tsx'));
const ScientificCalculator = lazy(() => import('./calculators/ScientificCalculator.tsx'));
const LoanCalculator = lazy(() => import('./calculators/LoanCalculator.tsx'));
const CompoundInterestCalculator = lazy(() => import('./calculators/CompoundInterestCalculator.tsx'));
const AdvancedRefinanceCalculator = lazy(() => import('./calculators/AdvancedRefinanceCalculator.tsx'));
const GlobalVatCalculator = lazy(() => import('./calculators/GlobalVatCalculator.tsx'));
const CompoundInterestMonthlyCalculator = lazy(() => import('./calculators/CompoundInterestMonthlyCalculator.tsx'));
const RetirementShortfallCalculator = lazy(() => import('./calculators/RetirementShortfallCalculator.tsx'));
const CashFlowBurnRateCalculator = lazy(() => import('./calculators/CashFlowBurnRateCalculator.tsx'));
const CapitalGainsTaxCalculator = lazy(() => import('./calculators/CapitalGainsTaxCalculator.tsx'));
const DripCalculator = lazy(() => import('./calculators/DripCalculator.tsx'));
const HsaGrowthCalculator = lazy(() => import('./calculators/HsaGrowthCalculator.tsx'));
const CollegeSavings529Calculator = lazy(() => import('./calculators/CollegeSavings529Calculator.tsx'));
const EmergencyFundExpenseCalculator = lazy(() => import('./calculators/EmergencyFundExpenseCalculator.tsx'));
const ReverseMortgageCalculator = lazy(() => import('./calculators/ReverseMortgageCalculator.tsx'));
const HelocCalculator = lazy(() => import('./calculators/HelocCalculator.tsx'));
const CryptoTaxCalculator = lazy(() => import('./calculators/CryptoTaxCalculator.tsx'));
const W4WithholdingCalculator = lazy(() => import('./calculators/W4WithholdingCalculator.tsx'));
const RoofPitchCalculator = lazy(() => import('./calculators/RoofPitchCalculator.tsx'));
const PregnancyDueDateCalculator = lazy(() => import('./calculators/PregnancyDueDateCalculator.tsx'));
const OvulationTrackerCalculator = lazy(() => import('./calculators/OvulationTrackerCalculator.tsx'));
const EvChargingCalculator = lazy(() => import('./calculators/EvChargingCalculator.tsx'));
const CarLeaseVsBuyCalculator = lazy(() => import('./calculators/CarLeaseVsBuyCalculator.tsx'));
const SolarBatteryCalculator = lazy(() => import('./calculators/SolarBatteryCalculator.tsx'));
const RentalCashFlowCalculator = lazy(() => import('./calculators/RentalCashFlowCalculator.tsx'));
const OvertimePayCalculator = lazy(() => import('./calculators/OvertimePayCalculator.tsx'));
const StudentLoanPayoffCalculator = lazy(() => import('./calculators/StudentLoanPayoffCalculator.tsx'));
const AsphaltPavingCalculator = lazy(() => import('./calculators/AsphaltPavingCalculator.tsx'));
const RetainingWallCalculator = lazy(() => import('./calculators/RetainingWallCalculator.tsx'));
const ContractorProfitCalculator = lazy(() => import('./calculators/ContractorProfitCalculator.tsx'));
const FenceMaterialCalculator = lazy(() => import('./calculators/FenceMaterialCalculator.tsx'));
const DrywallEstimatorCalculator = lazy(() => import('./calculators/DrywallEstimatorCalculator.tsx'));
const ConcreteCurbCalculator = lazy(() => import('./calculators/ConcreteCurbCalculator.tsx'));
const WaterIntakeCalculator = lazy(() => import('./calculators/WaterIntakeCalculator.tsx'));
const CommercialRealEstateCalculator = lazy(() => import('./calculators/CommercialRealEstateCalculator.tsx'));
const LaborBurdenCalculator = lazy(() => import('./calculators/LaborBurdenCalculator.tsx'));
const TileFlooringCalculator = lazy(() => import('./calculators/TileFlooringCalculator.tsx'));
const HvacBtuCalculator = lazy(() => import('./calculators/HvacBtuCalculator.tsx'));
const EmergencyRunwayCalculator = lazy(() => import('./calculators/EmergencyRunwayCalculator.tsx'));
const MultiProductBreakevenCalculator = lazy(() => import('./calculators/MultiProductBreakevenCalculator.tsx'));
const RoofShingleCalculator = lazy(() => import('./calculators/RoofShingleCalculator.tsx'));
const MacroProteinCalculator = lazy(() => import('./calculators/MacroProteinCalculator.tsx'));
const FreelanceRateCalculator = lazy(() => import('./calculators/FreelanceRateCalculator.tsx'));
const ShippingDimWeightCalculator = lazy(() => import('./calculators/ShippingDimWeightCalculator.tsx'));
const AnimalGestationCalculator = lazy(() => import('./calculators/AnimalGestationCalculator.tsx'));
const AnimalAgeCalculator = lazy(() => import('./calculators/AnimalAgeCalculator.tsx'));
const LivestockFeedCalculator = lazy(() => import('./calculators/LivestockFeedCalculator.tsx'));
const EggIncubationCalculator = lazy(() => import('./calculators/EggIncubationCalculator.tsx'));
const MilkProductionCalculator = lazy(() => import('./calculators/MilkProductionCalculator.tsx'));
const LivestockWeightEstimator = lazy(() => import('./calculators/LivestockWeightEstimator.tsx'));
const AnimalBreedingIntervalCalculator = lazy(() => import('./calculators/AnimalBreedingIntervalCalculator.tsx'));
const PetEnergyFoodCalculator = lazy(() => import('./calculators/PetEnergyFoodCalculator.tsx'));
const PetGrowthTrackerCalculator = lazy(() => import('./calculators/PetGrowthTrackerCalculator.tsx'));
const AquariumVolumeCalculator = lazy(() => import('./calculators/AquariumVolumeCalculator.tsx'));
const PondVolumeCalculator = lazy(() => import('./calculators/PondVolumeCalculator.tsx'));
const BusinessCalculator = lazy(() => import('./calculators/BusinessCalculator.tsx'));
const ConstructionCalculator = lazy(() => import('./calculators/ConstructionCalculator.tsx'));
const BmiCalculator = lazy(() => import('./calculators/BmiCalculator.tsx'));
const BmrCalorieCalculator = lazy(() => import('./calculators/BmrCalorieCalculator.tsx'));
const AgeCalculator = lazy(() => import('./calculators/AgeCalculator.tsx'));
const DateMathCalculator = lazy(() => import('./calculators/DateMathCalculator.tsx'));
const TimeZoneConverterCalculator = lazy(() => import('./calculators/TimeZoneConverterCalculator.tsx'));
const ElectricalCalculator = lazy(() => import('./calculators/ElectricalCalculator.tsx'));
const EngineeringCalculator = lazy(() => import('./calculators/EngineeringCalculator.tsx'));
const EverydayCalculator = lazy(() => import('./calculators/EverydayCalculator.tsx'));
const UnitConverterCalculator = lazy(() => import('./calculators/UnitConverterCalculator.tsx'));
const ToolsWorkspace = lazy(() => import('./calculators/ToolsWorkspace.tsx'));
const PdfToolsWorkspace = lazy(() => import('./calculators/PdfToolsWorkspace.tsx'));
const DocumentConvertersWorkspace = lazy(() => import('./calculators/DocumentConvertersWorkspace.tsx'));
const PasswordGeneratorCalculator = lazy(() => import('./calculators/PasswordGeneratorCalculator.tsx'));
const QrCodeGeneratorCalculator = lazy(() => import('./calculators/QrCodeGeneratorCalculator.tsx'));
const UuidGeneratorCalculator = lazy(() => import('./calculators/UuidGeneratorCalculator.tsx'));
const RandomNumberCalculator = lazy(() => import('./calculators/RandomNumberCalculator.tsx'));
const LoremIpsumCalculator = lazy(() => import('./calculators/LoremIpsumCalculator.tsx'));
const CryptoHashCalculator = lazy(() => import('./calculators/CryptoHashCalculator.tsx'));
const Base64CodecCalculator = lazy(() => import('./calculators/Base64CodecCalculator.tsx'));
const ColorPaletteCalculator = lazy(() => import('./calculators/ColorPaletteCalculator.tsx'));
const CssBoxShadowCalculator = lazy(() => import('./calculators/CssBoxShadowCalculator.tsx'));
const TextSlugCaseCalculator = lazy(() => import('./calculators/TextSlugCaseCalculator.tsx'));
const MonthlyBudgetPlannerCalculator = lazy(() => import('./calculators/MonthlyBudgetPlannerCalculator.tsx'));
const MealPlannerCalculator = lazy(() => import('./calculators/MealPlannerCalculator.tsx'));
const GroceryShoppingPlannerCalculator = lazy(() => import('./calculators/GroceryShoppingPlannerCalculator.tsx'));
const TravelItineraryPlannerCalculator = lazy(() => import('./calculators/TravelItineraryPlannerCalculator.tsx'));
const MovingPlannerCalculator = lazy(() => import('./calculators/MovingPlannerCalculator.tsx'));
const DailySchedulePlannerCalculator = lazy(() => import('./calculators/DailySchedulePlannerCalculator.tsx'));
const WeeklyTaskPlannerCalculator = lazy(() => import('./calculators/WeeklyTaskPlannerCalculator.tsx'));
const EventPartyPlannerCalculator = lazy(() => import('./calculators/EventPartyPlannerCalculator.tsx'));
const HomeMaintenancePlannerCalculator = lazy(() => import('./calculators/HomeMaintenancePlannerCalculator.tsx'));
const StudySchedulePlannerCalculator = lazy(() => import('./calculators/StudySchedulePlannerCalculator.tsx'));
const ProjectTimelinePlannerCalculator = lazy(() => import('./calculators/ProjectTimelinePlannerCalculator.tsx'));
const WeddingPlanningOrganizerCalculator = lazy(() => import('./calculators/WeddingPlanningOrganizerCalculator.tsx'));
const HomeRenovationPlannerCalculator = lazy(() => import('./calculators/HomeRenovationPlannerCalculator.tsx'));
const DebtRepaymentPlannerCalculator = lazy(() => import('./calculators/DebtRepaymentPlannerCalculator.tsx'));
const EmergencyFundPlannerCalculator = lazy(() => import('./calculators/EmergencyFundPlannerCalculator.tsx'));
const RetirementPlanningCalculator = lazy(() => import('./calculators/RetirementPlanningCalculator.tsx'));
const SocialMediaContentCalendarCalculator = lazy(() => import('./calculators/SocialMediaContentCalendarCalculator.tsx'));
const BusinessLaunchPlannerCalculator = lazy(() => import('./calculators/BusinessLaunchPlannerCalculator.tsx'));
const GardenPlantingPlannerCalculator = lazy(() => import('./calculators/GardenPlantingPlannerCalculator.tsx'));
const PersonalGoalOrganizerCalculator = lazy(() => import('./calculators/PersonalGoalOrganizerCalculator.tsx'));
const SubscriptionTrackerCalculator = lazy(() => import('./calculators/SubscriptionTrackerCalculator.tsx'));
const BillDueDateTrackerCalculator = lazy(() => import('./calculators/BillDueDateTrackerCalculator.tsx'));
const VehicleMaintenanceTrackerCalculator = lazy(() => import('./calculators/VehicleMaintenanceTrackerCalculator.tsx'));
const FuelMileageTrackerCalculator = lazy(() => import('./calculators/FuelMileageTrackerCalculator.tsx'));
const HomeInventoryTrackerCalculator = lazy(() => import('./calculators/HomeInventoryTrackerCalculator.tsx'));
const WarrantyExpirationTrackerCalculator = lazy(() => import('./calculators/WarrantyExpirationTrackerCalculator.tsx'));
const PetCareTrackerCalculator = lazy(() => import('./calculators/PetCareTrackerCalculator.tsx'));
const PlantGrowthTrackerCalculator = lazy(() => import('./calculators/PlantGrowthTrackerCalculator.tsx'));
const ScreenTimeTrackerCalculator = lazy(() => import('./calculators/ScreenTimeTrackerCalculator.tsx'));
const PersonalTimeTrackerCalculator = lazy(() => import('./calculators/PersonalTimeTrackerCalculator.tsx'));
const JsonValidatorCalculator = lazy(() => import('./calculators/JsonValidatorCalculator.tsx'));
const EmailValidatorCalculator = lazy(() => import('./calculators/EmailValidatorCalculator.tsx'));
const UrlValidatorCalculator = lazy(() => import('./calculators/UrlValidatorCalculator.tsx'));
const IbanValidatorCalculator = lazy(() => import('./calculators/IbanValidatorCalculator.tsx'));
const PasswordStrengthCheckerCalculator = lazy(() => import('./calculators/PasswordStrengthCheckerCalculator.tsx'));
const IpSubnetValidatorCalculator = lazy(() => import('./calculators/IpSubnetValidatorCalculator.tsx'));
const CreditCardValidatorCalculator = lazy(() => import('./calculators/CreditCardValidatorCalculator.tsx'));
const HtmlTagValidatorCalculator = lazy(() => import('./calculators/HtmlTagValidatorCalculator.tsx'));
const RegexTesterCalculator = lazy(() => import('./calculators/RegexTesterCalculator.tsx'));
const IsbnValidatorCalculator = lazy(() => import('./calculators/IsbnValidatorCalculator.tsx'));
const YamlValidatorCalculator = lazy(() => import('./calculators/YamlValidatorCalculator.tsx'));
const TomlValidatorCalculator = lazy(() => import('./calculators/TomlValidatorCalculator.tsx'));
const CsvValidatorCalculator = lazy(() => import('./calculators/CsvValidatorCalculator.tsx'));
const MarkdownSyntaxCheckerCalculator = lazy(() => import('./calculators/MarkdownSyntaxCheckerCalculator.tsx'));
const PhoneNumberCheckerCalculator = lazy(() => import('./calculators/PhoneNumberCheckerCalculator.tsx'));
const DatetimeFormatValidatorCalculator = lazy(() => import('./calculators/DatetimeFormatValidatorCalculator.tsx'));
const ColorContrastCheckerCalculator = lazy(() => import('./calculators/ColorContrastCheckerCalculator.tsx'));
const MimeSignatureCheckerCalculator = lazy(() => import('./calculators/MimeSignatureCheckerCalculator.tsx'));
const DuplicateFileCheckerCalculator = lazy(() => import('./calculators/DuplicateFileCheckerCalculator.tsx'));
const SeoChecklistCheckerCalculator = lazy(() => import('./calculators/SeoChecklistCheckerCalculator.tsx'));
const WaterIntakeTrackerCalculator = lazy(() => import('./calculators/WaterIntakeTrackerCalculator.tsx'));
const HabitStreakTrackerCalculator = lazy(() => import('./calculators/HabitStreakTrackerCalculator.tsx'));
const ExpenseSavingsTrackerCalculator = lazy(() => import('./calculators/ExpenseSavingsTrackerCalculator.tsx'));
const WorkoutFitnessTrackerCalculator = lazy(() => import('./calculators/WorkoutFitnessTrackerCalculator.tsx'));
const SleepDurationTrackerCalculator = lazy(() => import('./calculators/SleepDurationTrackerCalculator.tsx'));
const CalorieMacroTrackerCalculator = lazy(() => import('./calculators/CalorieMacroTrackerCalculator.tsx'));
const WeightBodyMetricsTrackerCalculator = lazy(() => import('./calculators/WeightBodyMetricsTrackerCalculator.tsx'));
const TaskMilestoneTrackerCalculator = lazy(() => import('./calculators/TaskMilestoneTrackerCalculator.tsx'));
const MoodWellnessTrackerCalculator = lazy(() => import('./calculators/MoodWellnessTrackerCalculator.tsx'));
const ReadingBookTrackerCalculator = lazy(() => import('./calculators/ReadingBookTrackerCalculator.tsx'));
const PeriodicTableReferenceCalculator = lazy(() => import('./calculators/PeriodicTableReferenceCalculator.tsx'));
const MathFormulasReferenceCalculator = lazy(() => import('./calculators/MathFormulasReferenceCalculator.tsx'));
const HttpStatusReferenceCalculator = lazy(() => import('./calculators/HttpStatusReferenceCalculator.tsx'));
const MarkdownSyntaxReferenceCalculator = lazy(() => import('./calculators/MarkdownSyntaxReferenceCalculator.tsx'));
const AsciiUnicodeReferenceCalculator = lazy(() => import('./calculators/AsciiUnicodeReferenceCalculator.tsx'));
const CssFlexGridReferenceCalculator = lazy(() => import('./calculators/CssFlexGridReferenceCalculator.tsx'));
const UnitConversionFactorsReferenceCalculator = lazy(() => import('./calculators/UnitConversionFactorsReferenceCalculator.tsx'));
const ProgrammingSyntaxReferenceCalculator = lazy(() => import('./calculators/ProgrammingSyntaxReferenceCalculator.tsx'));
const SqlCommandsReferenceCalculator = lazy(() => import('./calculators/SqlCommandsReferenceCalculator.tsx'));
const PaperResolutionReferenceCalculator = lazy(() => import('./calculators/PaperResolutionReferenceCalculator.tsx'));
const JsonCsvConverterCalculator = lazy(() => import('./calculators/JsonCsvConverterCalculator.tsx'));
const TextDiffCheckerCalculator = lazy(() => import('./calculators/TextDiffCheckerCalculator.tsx'));
const UrlEncoderDecoderCalculator = lazy(() => import('./calculators/UrlEncoderDecoderCalculator.tsx'));
const JwtDecoderCalculator = lazy(() => import('./calculators/JwtDecoderCalculator.tsx'));
const EpochTimestampCalculator = lazy(() => import('./calculators/EpochTimestampCalculator.tsx'));
const CssGradientGeneratorCalculator = lazy(() => import('./calculators/CssGradientGeneratorCalculator.tsx'));
const HtmlEntityEncoderCalculator = lazy(() => import('./calculators/HtmlEntityEncoderCalculator.tsx'));
const XmlToJsonCalculator = lazy(() => import('./calculators/XmlToJsonCalculator.tsx'));
const CronExpressionCalculator = lazy(() => import('./calculators/CronExpressionCalculator.tsx'));
const ImageDimensionCalculator = lazy(() => import('./calculators/ImageDimensionCalculator.tsx'));
const HtmlBoilerplateGeneratorCalculator = lazy(() => import('./calculators/HtmlBoilerplateGeneratorCalculator.tsx'));
const CssResetGeneratorCalculator = lazy(() => import('./calculators/CssResetGeneratorCalculator.tsx'));
const FaviconGeneratorCalculator = lazy(() => import('./calculators/FaviconGeneratorCalculator.tsx'));
const MetaTagsGeneratorCalculator = lazy(() => import('./calculators/MetaTagsGeneratorCalculator.tsx'));
const OpenGraphGeneratorCalculator = lazy(() => import('./calculators/OpenGraphGeneratorCalculator.tsx'));
const RobotsGeneratorCalculator = lazy(() => import('./calculators/RobotsGeneratorCalculator.tsx'));
const SitemapGeneratorCalculator = lazy(() => import('./calculators/SitemapGeneratorCalculator.tsx'));
const JsonMockGeneratorCalculator = lazy(() => import('./calculators/JsonMockGeneratorCalculator.tsx'));
const SqlDataGeneratorCalculator = lazy(() => import('./calculators/SqlDataGeneratorCalculator.tsx'));
const InvoiceNumberGeneratorCalculator = lazy(() => import('./calculators/InvoiceNumberGeneratorCalculator.tsx'));

interface CalculatorViewProps {
  calculator: CalculatorMeta;
  onBack: () => void;
  onSelectCalculator: (id: CalculatorId) => void;
  onNavigateHome?: () => void;
  onNavigateAllTools?: () => void;
  onNavigateCategories?: () => void;
  onNavigateCategory?: (categorySlug: string) => void;
  onNavigateSubcategory?: (categorySlug: string, subcategorySlug: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: CalculatorId) => void;
  favoriteIds?: CalculatorId[];
}

export default function CalculatorView({
  calculator,
  onBack,
  onSelectCalculator,
  onNavigateHome,
  onNavigateAllTools,
  onNavigateCategories,
  onNavigateCategory,
  onNavigateSubcategory,
  isFavorite = false,
  onToggleFavorite,
  favoriteIds = []
}: CalculatorViewProps) {
  const { language, t } = useTranslation();
  let usesEngineFallback = false;

  const renderCalculatorComponent = () => {
    switch (calculator.id) {
      case 'percentage':
        return <BasicMathCalculator />;
      case 'quadratic':
        return <AlgebraCalculator initialTool="quadratic" />;
      case 'slope-intercept':
        return <AlgebraCalculator initialTool="linear" />;
      case 'area-shapes':
        return <AreaCalculator />;
      case 'volume-surface':
        return <VolumeCalculator />;
      case 'pythagorean':
        return <TrigCalculator initialFocus="pythagorean" />;
      case 'trig-solver':
        return <TrigCalculator initialFocus="trig" />;
      case 'stats-summary':
        return <StatisticsCalculator />;
      case 'scientific-calc':
        return <ScientificCalculator />;
      case 'loan-mortgage':
        return <LoanCalculator />;
      case 'compound-interest':
        return <CompoundInterestCalculator />;
      case 'advanced-mortgage-refinance-calc':
        return <AdvancedRefinanceCalculator />;
      case 'global-vat-sales-tax-calc':
        return <GlobalVatCalculator />;
      case 'compound-interest-monthly-simulator':
        return <CompoundInterestMonthlyCalculator />;
      case 'retirement-shortfall-gap-calc':
        return <RetirementShortfallCalculator />;
      case 'cash-flow-burn-rate-calc':
        return <CashFlowBurnRateCalculator />;
      case '401k-savings-calc':
        return <RetirementPlanningCalculator />;
      case 'capital-gains-tax-estimator':
        return <CapitalGainsTaxCalculator />;
      case 'dividend-reinvestment-drip-calc':
        return <DripCalculator />;
      case 'hsa-growth-tax-savings-calc':
        return <HsaGrowthCalculator />;
      case 'college-savings-529-calc':
        return <CollegeSavings529Calculator />;
      case 'emergency-fund-expense-calc':
        return <EmergencyFundExpenseCalculator />;
      case 'reverse-mortgage-calc':
        return <ReverseMortgageCalculator />;
      case 'heloc-calc':
        return <HelocCalculator />;
      case 'crypto-tax-calc':
        return <CryptoTaxCalculator />;
      case 'w4-withholding-calc':
        return <W4WithholdingCalculator />;
      case 'roof-pitch-calc':
        return <RoofPitchCalculator />;
      case 'pregnancy-due-date-calc':
        return <PregnancyDueDateCalculator />;
      case 'ovulation-tracker-calc':
        return <OvulationTrackerCalculator />;
      case 'ev-charging-calc':
        return <EvChargingCalculator />;
      case 'lease-vs-buy-calc':
        return <CarLeaseVsBuyCalculator />;
      case 'solar-battery-calc':
        return <SolarBatteryCalculator />;
      case 'rental-cashflow-calc':
        return <RentalCashFlowCalculator />;
      case 'overtime-pay-calc':
        return <OvertimePayCalculator />;
      case 'student-loan-payoff-calc':
        return <StudentLoanPayoffCalculator />;
      case 'asphalt-paving-calc':
        return <AsphaltPavingCalculator />;
      case 'retaining-wall-calc':
        return <RetainingWallCalculator />;
      case 'contractor-profit-calc':
        return <ContractorProfitCalculator />;
      case 'fence-material-calc':
        return <FenceMaterialCalculator />;
      case 'drywall-estimator-calc':
        return <DrywallEstimatorCalculator />;
      case 'concrete-curb-calc':
        return <ConcreteCurbCalculator />;
      case 'water-intake-calc':
        return <WaterIntakeCalculator />;
      case 'cre-irr-calc':
        return <CommercialRealEstateCalculator />;
      case 'labor-burden-calc':
        return <LaborBurdenCalculator />;
      case 'tile-flooring-calc':
        return <TileFlooringCalculator />;
      case 'hvac-btu-calc':
        return <HvacBtuCalculator />;
      case 'emergency-runway-calc':
        return <EmergencyRunwayCalculator />;
      case 'multi-breakeven-calc':
        return <MultiProductBreakevenCalculator />;
      case 'roof-shingle-calc':
        return <RoofShingleCalculator />;
      case 'macro-protein-calc':
        return <MacroProteinCalculator />;
      case 'freelance-rate-calc':
        return <FreelanceRateCalculator />;
      case 'dim-weight-calc':
        return <ShippingDimWeightCalculator />;
      case 'animal-gestation-calc':
        return <AnimalGestationCalculator />;
      case 'animal-age-calc':
        return <AnimalAgeCalculator />;
      case 'livestock-feed-calc':
        return <LivestockFeedCalculator />;
      case 'egg-incubation-calc':
        return <EggIncubationCalculator />;
      case 'milk-production-calc':
        return <MilkProductionCalculator />;
      case 'livestock-weight-calc':
        return <LivestockWeightEstimator />;
      case 'animal-breeding-interval-calc':
        return <AnimalBreedingIntervalCalculator />;
      case 'pet-energy-food-calc':
        return <PetEnergyFoodCalculator />;
      case 'pet-growth-tracker-calc':
        return <PetGrowthTrackerCalculator />;
      case 'aquarium-volume-calc':
        return <AquariumVolumeCalculator />;
      case 'pond-volume-calc':
        return <PondVolumeCalculator />;
      case 'break-even':
        return <BusinessCalculator initialTool="breakeven" />;
      case 'profit-margin':
        return <BusinessCalculator initialTool="margin" />;
      case 'construction-calc':
        return <ConstructionCalculator />;
      case 'bmi':
        return <BmiCalculator />;
      case 'bmr-tdee':
        return <BmrCalorieCalculator />;
      case 'exact-age':
        return <AgeCalculator />;
      case 'date-difference':
        return <DateMathCalculator />;
      case 'timezone-offset-converter':
        return <TimeZoneConverterCalculator />;
      case 'ohms-law':
        return <ElectricalCalculator initialTool="ohms" />;
      case 'electricity-cost':
        return <ElectricalCalculator initialTool="cost" />;
      case 'hydraulic-force':
        return <EngineeringCalculator initialTool="hydraulic" />;
      case 'kinetic-energy':
        return <EngineeringCalculator initialTool="energy" />;
      case 'tip-split':
        return <EverydayCalculator initialTool="tip" />;
      case 'discount-tax':
        return <EverydayCalculator initialTool="discount" />;
      case 'universal-unit-converter':
        return <UnitConverterCalculator initialDimension="length" />;
      case 'length-converter':
        return <UnitConverterCalculator initialDimension="length" />;
      case 'weight-mass-converter':
        return <UnitConverterCalculator initialDimension="mass" />;
      case 'temperature-converter':
        return <UnitConverterCalculator initialDimension="temperature" />;
      case 'volume-converter':
        return <UnitConverterCalculator initialDimension="volume" />;
      case 'area-converter':
        return <UnitConverterCalculator initialDimension="area" />;
      case 'digital-storage-converter':
        return <UnitConverterCalculator initialDimension="digital" />;
      case 'speed-converter':
        return <UnitConverterCalculator initialDimension="speed" />;
      case 'pressure-converter':
        return <UnitConverterCalculator initialDimension="pressure" />;
      case 'energy-power-converter':
        return <UnitConverterCalculator initialDimension="energy" />;
      case 'time-frequency-converter':
        return <UnitConverterCalculator initialDimension="time" />;
      case 'angle-converter':
        return <UnitConverterCalculator initialDimension="angle" />;
      case 'fuel-economy-converter':
        return <UnitConverterCalculator initialDimension="fuel" />;
      case 'torque-converter':
        return <UnitConverterCalculator initialDimension="torque" />;
      case 'force-converter':
        return <UnitConverterCalculator initialDimension="force" />;
      case 'cooking-measurement-converter':
        return <UnitConverterCalculator initialDimension="cooking" />;
      case 'typography-converter':
        return <UnitConverterCalculator initialDimension="typography" />;
      case 'data-transfer-rate-converter':
        return <UnitConverterCalculator initialDimension="dataRate" />;
      case 'sound-level-converter':
        return <UnitConverterCalculator initialDimension="sound" />;
      case 'shoe-size-converter':
        return <UnitConverterCalculator initialDimension="shoeSize" />;
      case 'clothing-size-converter':
        return <UnitConverterCalculator initialDimension="clothingSize" />;
      case 'secure-password-generator':
        return <PasswordGeneratorCalculator />;
      case 'qr-code-generator':
        return <QrCodeGeneratorCalculator />;
      case 'uuid-v4-generator':
        return <UuidGeneratorCalculator />;
      case 'random-number-generator':
        return <RandomNumberCalculator />;
      case 'lorem-ipsum-generator':
        return <LoremIpsumCalculator />;
      case 'crypto-hash-generator':
        return <CryptoHashCalculator />;
      case 'base64-codec-generator':
        return <Base64CodecCalculator />;
      case 'color-palette-generator':
        return <ColorPaletteCalculator />;
      case 'css-box-shadow-generator':
        return <CssBoxShadowCalculator />;
      case 'text-slug-case-generator':
        return <TextSlugCaseCalculator />;
      case 'html-boilerplate-generator':
        return <HtmlBoilerplateGeneratorCalculator />;
      case 'css-reset-generator':
        return <CssResetGeneratorCalculator />;
      case 'favicon-generator':
        return <FaviconGeneratorCalculator />;
      case 'meta-tags-generator':
        return <MetaTagsGeneratorCalculator />;
      case 'open-graph-generator':
        return <OpenGraphGeneratorCalculator />;
      case 'robots-generator':
        return <RobotsGeneratorCalculator />;
      case 'sitemap-generator':
        return <SitemapGeneratorCalculator />;
      case 'json-mock-generator':
        return <JsonMockGeneratorCalculator />;
      case 'sql-data-generator':
        return <SqlDataGeneratorCalculator />;
      case 'invoice-number-generator':
        return <InvoiceNumberGeneratorCalculator />;
      case 'monthly-budget-planner':
        return <MonthlyBudgetPlannerCalculator />;
      case 'meal-planner':
        return <MealPlannerCalculator />;
      case 'grocery-shopping-planner':
        return <GroceryShoppingPlannerCalculator />;
      case 'travel-itinerary-planner':
        return <TravelItineraryPlannerCalculator />;
      case 'moving-planner':
        return <MovingPlannerCalculator />;
      case 'daily-schedule-planner':
        return <DailySchedulePlannerCalculator />;
      case 'weekly-task-planner':
        return <WeeklyTaskPlannerCalculator />;
      case 'event-party-planner':
        return <EventPartyPlannerCalculator />;
      case 'home-maintenance-planner':
        return <HomeMaintenancePlannerCalculator />;
      case 'study-schedule-planner':
        return <StudySchedulePlannerCalculator />;
      case 'project-timeline-planner':
        return <ProjectTimelinePlannerCalculator />;
      case 'wedding-planning-organizer':
        return <WeddingPlanningOrganizerCalculator />;
      case 'home-renovation-planner':
        return <HomeRenovationPlannerCalculator />;
      case 'debt-repayment-planner':
        return <DebtRepaymentPlannerCalculator />;
      case 'emergency-fund-planner':
        return <EmergencyFundPlannerCalculator />;
      case 'retirement-planning-calculator':
        return <RetirementPlanningCalculator />;
      case 'social-media-content-calendar':
        return <SocialMediaContentCalendarCalculator />;
      case 'business-launch-planner':
        return <BusinessLaunchPlannerCalculator />;
      case 'garden-planting-planner':
        return <GardenPlantingPlannerCalculator />;
      case 'personal-goal-organizer':
        return <PersonalGoalOrganizerCalculator />;
      case 'subscription-tracker':
        return <SubscriptionTrackerCalculator />;
      case 'bill-due-date-tracker':
        return <BillDueDateTrackerCalculator />;
      case 'vehicle-maintenance-tracker':
        return <VehicleMaintenanceTrackerCalculator />;
      case 'fuel-mileage-tracker':
        return <FuelMileageTrackerCalculator />;
      case 'home-inventory-tracker':
        return <HomeInventoryTrackerCalculator />;
      case 'warranty-expiration-tracker':
        return <WarrantyExpirationTrackerCalculator />;
      case 'pet-care-tracker':
        return <PetCareTrackerCalculator />;
      case 'plant-growth-tracker':
        return <PlantGrowthTrackerCalculator />;
      case 'screen-time-tracker':
        return <ScreenTimeTrackerCalculator />;
      case 'personal-time-tracker':
        return <PersonalTimeTrackerCalculator />;
      case 'json-validator':
        return <JsonValidatorCalculator />;
      case 'email-validator':
        return <EmailValidatorCalculator />;
      case 'url-validator':
        return <UrlValidatorCalculator />;
      case 'iban-validator':
        return <IbanValidatorCalculator />;
      case 'password-strength-checker':
        return <PasswordStrengthCheckerCalculator />;
      case 'ip-subnet-validator':
        return <IpSubnetValidatorCalculator />;
      case 'credit-card-validator':
        return <CreditCardValidatorCalculator />;
      case 'html-tag-validator':
        return <HtmlTagValidatorCalculator />;
      case 'regex-tester':
        return <RegexTesterCalculator />;
      case 'isbn-validator':
        return <IsbnValidatorCalculator />;
      case 'yaml-validator':
        return <YamlValidatorCalculator />;
      case 'toml-validator':
        return <TomlValidatorCalculator />;
      case 'csv-validator':
        return <CsvValidatorCalculator />;
      case 'markdown-syntax-checker':
        return <MarkdownSyntaxCheckerCalculator />;
      case 'phone-number-checker':
        return <PhoneNumberCheckerCalculator />;
      case 'datetime-format-validator':
        return <DatetimeFormatValidatorCalculator />;
      case 'color-contrast-checker':
        return <ColorContrastCheckerCalculator />;
      case 'mime-signature-checker':
        return <MimeSignatureCheckerCalculator />;
      case 'duplicate-file-checker':
        return <DuplicateFileCheckerCalculator />;
      case 'seo-checklist-checker':
        return <SeoChecklistCheckerCalculator />;
      case 'water-intake-tracker':
        return <WaterIntakeTrackerCalculator />;
      case 'habit-streak-tracker':
        return <HabitStreakTrackerCalculator />;
      case 'expense-savings-tracker':
        return <ExpenseSavingsTrackerCalculator />;
      case 'workout-fitness-tracker':
        return <WorkoutFitnessTrackerCalculator />;
      case 'sleep-duration-tracker':
        return <SleepDurationTrackerCalculator />;
      case 'calorie-macro-tracker':
        return <CalorieMacroTrackerCalculator />;
      case 'weight-body-metrics-tracker':
        return <WeightBodyMetricsTrackerCalculator />;
      case 'task-milestone-tracker':
        return <TaskMilestoneTrackerCalculator />;
      case 'mood-wellness-tracker':
        return <MoodWellnessTrackerCalculator />;
      case 'reading-book-tracker':
        return <ReadingBookTrackerCalculator />;
      case 'periodic-table-reference':
        return <PeriodicTableReferenceCalculator />;
      case 'math-formulas-reference':
        return <MathFormulasReferenceCalculator />;
      case 'http-status-reference':
        return <HttpStatusReferenceCalculator />;
      case 'markdown-syntax-reference':
        return <MarkdownSyntaxReferenceCalculator />;
      case 'ascii-unicode-reference':
        return <AsciiUnicodeReferenceCalculator />;
      case 'css-flex-grid-reference':
        return <CssFlexGridReferenceCalculator />;
      case 'unit-conversion-factors-reference':
        return <UnitConversionFactorsReferenceCalculator />;
      case 'programming-syntax-reference':
        return <ProgrammingSyntaxReferenceCalculator />;
      case 'sql-commands-reference':
        return <SqlCommandsReferenceCalculator />;
      case 'paper-resolution-reference':
        return <PaperResolutionReferenceCalculator />;
      case 'json-csv-converter':
        return <JsonCsvConverterCalculator />;
      case 'text-diff-checker':
        return <TextDiffCheckerCalculator />;
      case 'url-encoder-decoder':
        return <UrlEncoderDecoderCalculator />;
      case 'jwt-decoder':
        return <JwtDecoderCalculator />;
      case 'epoch-timestamp':
        return <EpochTimestampCalculator />;
      case 'css-gradient-generator':
        return <CssGradientGeneratorCalculator />;
      case 'html-entity-encoder':
        return <HtmlEntityEncoderCalculator />;
      case 'xml-to-json':
        return <XmlToJsonCalculator />;
      case 'cron-expression-calculator':
        return <CronExpressionCalculator />;
      case 'image-dimension-calculator':
        return <ImageDimensionCalculator />;
      default:
        if (calculator.category === 'tools') {
          return <ToolsWorkspace initialTool={calculator.id} />;
        }
        if (calculator.category === 'pdf-tools') {
          return <PdfToolsWorkspace initialTool={calculator.id} />;
        }
        if (calculator.category === 'document-converters') {
          return <DocumentConvertersWorkspace initialTool={calculator.id} />;
        }
        usesEngineFallback = true;
        return <EngineCalculatorView calculator={calculator} />;
    }
  };

  const renderedTool = renderCalculatorComponent();
  const bareWorkspace = usesEngineFallback || isNativePhase4Workspace(calculator);

  return (
    <CalculatorPageLayout
      calculator={calculator}
      onBack={onBack}
      onSelectCalculator={onSelectCalculator}
      onNavigateHome={onNavigateHome}
      onNavigateCategories={onNavigateCategories}
      onNavigateCategory={onNavigateCategory}
      onNavigateSubcategory={onNavigateSubcategory}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      favoriteIds={favoriteIds}
      bareWorkspace={bareWorkspace}
    >
      <ErrorBoundary
        scope="calculator"
        resetKey={calculator.id}
        onNavigateHome={onNavigateHome || onBack}
        onNavigateAllTools={onNavigateAllTools}
        language={language}
      >
        <Suspense fallback={<div className="py-12 text-center text-text-secondary animate-pulse">{t('msg.loading')}</div>}>
          {renderedTool}
        </Suspense>
      </ErrorBoundary>
    </CalculatorPageLayout>
  );
}
