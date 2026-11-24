import { CategoryMeta, SubcategoryMeta, CalculatorMeta, CategoryId } from '../types.ts';
import { BATCH1_METADATA } from './catalog/batch1_math_algebra.ts';
import { BATCH2_METADATA } from './catalog/batch2_geometry_trig.ts';
import { BATCH3_METADATA } from './catalog/batch3_stats_scientific.ts';
import { BATCH4_METADATA } from './catalog/batch4_financial.ts';
import { BATCH5_METADATA } from './catalog/batch5_business.ts';
import { BATCH6_METADATA } from './catalog/batch6_construction.ts';
import { BATCH7_METADATA } from './catalog/batch7_health.ts';
import { BATCH8_METADATA } from './catalog/batch8_datetime.ts';
import { BATCH9_METADATA } from './catalog/batch9_electrical.ts';
import { BATCH10_METADATA } from './catalog/batch10_engineering_everyday.ts';
import { BATCH11_METADATA, BATCH11_SUBCATEGORIES } from './catalog/batch11_expansion_batch1.ts';
import { BATCH12_METADATA, BATCH12_SUBCATEGORIES } from './catalog/batch12_expansion_batch2.ts';
import { BATCH13_METADATA, BATCH13_SUBCATEGORIES } from './catalog/batch13_expansion_batch3.ts';
import { BATCH14_METADATA, BATCH14_SUBCATEGORIES } from './catalog/batch14_expansion_batch4.ts';
import { BATCH15_METADATA, BATCH15_SUBCATEGORIES } from './catalog/batch15_expansion_batch5.ts';
import { BATCH16_METADATA, BATCH16_SUBCATEGORIES } from './catalog/batch16_expansion_batch6.ts';
import { BATCH17_METADATA, BATCH17_SUBCATEGORIES } from './catalog/batch17_converters.ts';
import { BATCH18_METADATA, BATCH18_SUBCATEGORIES } from './catalog/batch18_tools.ts';
import { BATCH19_METADATA, BATCH19_SUBCATEGORIES } from './catalog/batch19_generators.ts';
import { BATCH20_METADATA, BATCH20_SUBCATEGORIES } from './catalog/batch20_planners.ts';
import { BATCH21_METADATA, BATCH21_SUBCATEGORIES } from './catalog/batch21_checkers.ts';
import { BATCH22_METADATA, BATCH22_SUBCATEGORIES } from './catalog/batch22_trackers.ts';
import { BATCH23_METADATA, BATCH23_SUBCATEGORIES } from './catalog/batch23_guides.ts';
import { BATCH24_METADATA, BATCH24_SUBCATEGORIES } from './catalog/batch24_additional_tools.ts';
import { BATCH25_METADATA, BATCH25_SUBCATEGORIES } from './catalog/batch25_planners_expansion.ts';
import { BATCH26_METADATA, BATCH26_SUBCATEGORIES } from './catalog/batch26_trackers_expansion.ts';
import { BATCH27_METADATA, BATCH27_SUBCATEGORIES } from './catalog/batch27_phase12_expansion.ts';
import { BATCH28_METADATA, BATCH28_SUBCATEGORIES } from './catalog/batch28_phase13a_calculators.ts';
import { BATCH29_METADATA, BATCH29_SUBCATEGORIES } from './catalog/batch29_phase13b_expansion.ts';
import { BATCH30_METADATA, BATCH30_SUBCATEGORIES } from './catalog/batch30_phase13c_generators.ts';
import { BATCH31_METADATA, BATCH31_SUBCATEGORIES } from './catalog/batch31_phase13d_planners.ts';
import { BATCH32_METADATA, BATCH32_SUBCATEGORIES } from './catalog/batch32_phase13e_tools.ts';
import { BATCH33_METADATA, BATCH33_SUBCATEGORIES } from './catalog/batch33_phase13f_trackers_guides.ts';
import { BATCH34_METADATA, BATCH34_SUBCATEGORIES } from './catalog/batch34_phase15a_expansion.ts';
import { BATCH35_METADATA, BATCH35_SUBCATEGORIES } from './catalog/batch35_phase15b_expansion.ts';
import { BATCH36_METADATA, BATCH36_SUBCATEGORIES } from './catalog/batch36_phase15c_expansion.ts';
import { BATCH37_METADATA, BATCH37_SUBCATEGORIES } from './catalog/batch37_phase15d_expansion.ts';
import { BATCH38_METADATA, BATCH38_SUBCATEGORIES } from './catalog/batch38_phase15e_expansion.ts';
import { BATCH39_METADATA, BATCH39_SUBCATEGORIES } from './catalog/batch39_phase15f_expansion.ts';
import { BATCH40_METADATA, BATCH40_SUBCATEGORIES } from './catalog/batch40_phase15g_expansion.ts';
import { BATCH41_METADATA, BATCH41_SUBCATEGORIES } from './catalog/batch41_phase15h_expansion.ts';
import { BATCH42_METADATA, BATCH42_SUBCATEGORIES } from './catalog/batch42_phase15i_expansion.ts';
import { BATCH43_METADATA, BATCH43_SUBCATEGORIES } from './catalog/batch43_phase15j_expansion.ts';
import { BATCH44_METADATA, BATCH44_SUBCATEGORIES } from './catalog/batch44_phase16a_expansion.ts';
import { BATCH45_METADATA, BATCH45_SUBCATEGORIES } from './catalog/batch45_phase16b_expansion.ts';
import { BATCH46_METADATA, BATCH46_SUBCATEGORIES } from './catalog/batch46_phase16c_expansion.ts';
import { BATCH47_METADATA, BATCH47_SUBCATEGORIES } from './catalog/batch47_phase16d_expansion.ts';
import { BATCH48_METADATA, BATCH48_SUBCATEGORIES } from './catalog/batch48_phase16e_expansion.ts';
import { BATCH49_METADATA, BATCH49_SUBCATEGORIES } from './catalog/batch49_phase16f_expansion.ts';
import { BATCH50_METADATA, BATCH50_SUBCATEGORIES } from './catalog/batch50_phase16g_expansion.ts';
import { BATCH51_METADATA, BATCH51_SUBCATEGORIES } from './catalog/batch51_phase16h_expansion.ts';
import { BATCH52_METADATA, BATCH52_SUBCATEGORIES } from './catalog/batch52_phase16i_expansion.ts';
import { BATCH53_METADATA, BATCH53_SUBCATEGORIES } from './catalog/batch53_phase16j_expansion.ts';
import { BATCH54_METADATA, BATCH54_SUBCATEGORIES } from './catalog/batch54_phase17a_expansion.ts';
import { BATCH55_METADATA, BATCH55_SUBCATEGORIES } from './catalog/batch55_phase17b_expansion.ts';
import { BATCH56_METADATA, BATCH56_SUBCATEGORIES } from './catalog/batch56_phase17c_expansion.ts';
import { BATCH57_METADATA, BATCH57_SUBCATEGORIES } from './catalog/batch57_phase17d_expansion.ts';
import { BATCH58_METADATA, BATCH58_SUBCATEGORIES } from './catalog/batch58_phase17e_expansion.ts';
import { BATCH59_METADATA, BATCH59_SUBCATEGORIES } from './catalog/batch59_phase17f_expansion.ts';
import { BATCH64_FINANCE_BATCH1_METADATA } from './catalog/batch64_phase48_finance_batch1.ts';
import { BATCH65_FINANCE_BATCH2_METADATA } from './catalog/batch65_phase50_finance_batch2.ts';
import { BATCH66_PHASE56_BATCH1_METADATA } from './catalog/batch66_phase56_batch1_implementation.ts';
import { BATCH67_PHASE62_BATCH2_METADATA } from './catalog/batch67_phase62_batch2_implementation.ts';
import { BATCH68_PHASE66_BATCH3_METADATA } from './catalog/batch68_phase66_batch3_implementation.ts';
import { BATCH69_ANIMAL_GESTATION_METADATA } from './catalog/batch69_animal_gestation.ts';
import { BATCH70_METADATA, BATCH70_SUBCATEGORIES } from './catalog/batch70_agriculture_batch2.ts';
import { BATCH81_BATCH_A_METADATA } from './catalog/batch81_batch_a.ts';
import { BATCH82D_GROUP1_METADATA } from './catalog/batch82d_group1.ts';
import { BATCH82D_GROUP2_METADATA } from './catalog/batch82d_group2.ts';
import { BATCH82D_GROUP3_METADATA } from './catalog/batch82d_group3.ts';
import { BATCH82D_GROUP4_METADATA } from './catalog/batch82d_group4.ts';
import { BATCH82D_GROUP5_METADATA } from './catalog/batch82d_group5.ts';
import { BATCH82D_GROUP6_METADATA } from './catalog/batch82d_group6.ts';
import { BATCH82D_GROUP7_METADATA } from './catalog/batch82d_group7.ts';
import { BATCH82D_GROUP8_METADATA } from './catalog/batch82d_group8.ts';
import { BATCH83_GROUP1_METADATA } from './catalog/batch83_group1.ts';
import { BATCH83_GROUP2_METADATA } from './catalog/batch83_group2.ts';
import { BATCH83_GROUP3_METADATA } from './catalog/batch83_group3.ts';
import { BATCH83_GROUP4_METADATA } from './catalog/batch83_group4.ts';
import { BATCH83_GROUP5_METADATA } from './catalog/batch83_group5.ts';
import { BATCH83_GROUP6_METADATA } from './catalog/batch83_group6.ts';
import { BATCH83_GROUP7_METADATA } from './catalog/batch83_group7.ts';
import { BATCH83_GROUP8_METADATA } from './catalog/batch83_group8.ts';
import { BATCH84_GROUP1_METADATA } from './catalog/batch84_group1.ts';
import { BATCH84_GROUP2_METADATA } from './catalog/batch84_group2.ts';
import { BATCH84_GROUP3_METADATA } from './catalog/batch84_group3.ts';
import { BATCH84_GROUP4_METADATA } from './catalog/batch84_group4.ts';
import { BATCH84_GROUP5_METADATA } from './catalog/batch84_group5.ts';
import { BATCH84_GROUP6_METADATA } from './catalog/batch84_group6.ts';
import { BATCH84_GROUP7_METADATA } from './catalog/batch84_group7.ts';
import { BATCH84_GROUP8_METADATA } from './catalog/batch84_group8.ts';
import { BATCH84C_GROUP1_METADATA } from './catalog/batch84c_group1.ts';
import { BATCH84C_GROUP2_METADATA } from './catalog/batch84c_group2.ts';
import { BATCH84C_GROUP3_METADATA } from './catalog/batch84c_group3.ts';
import { BATCH84C_GROUP4_METADATA } from './catalog/batch84c_group4.ts';
import { BATCH84C_GROUP5_METADATA } from './catalog/batch84c_group5.ts';
import { BATCH84C_GROUP6_METADATA } from './catalog/batch84c_group6.ts';
import { BATCH84C_GROUP7_METADATA } from './catalog/batch84c_group7.ts';
import { BATCH84C_GROUP8_METADATA } from './catalog/batch84c_group8.ts';
import { BATCH84D_GROUP1_METADATA } from './catalog/batch84d_group1.ts';
import { BATCH84D_GROUP2_METADATA } from './catalog/batch84d_group2.ts';
import { BATCH84D_GROUP3_METADATA } from './catalog/batch84d_group3.ts';
import { BATCH84D_GROUP4_METADATA } from './catalog/batch84d_group4.ts';
import { BATCH84D_GROUP5_METADATA } from './catalog/batch84d_group5.ts';
import { BATCH84D_GROUP6_METADATA } from './catalog/batch84d_group6.ts';
import { BATCH84D_GROUP7_METADATA } from './catalog/batch84d_group7.ts';
import { BATCH84D_GROUP8_METADATA } from './catalog/batch84d_group8.ts';
import { BATCH85C_GROUP01_METADATA } from './catalog/batch85c_group01.ts';
import { BATCH85C_GROUP02_METADATA } from './catalog/batch85c_group02.ts';
import { BATCH85C_GROUP03_METADATA } from './catalog/batch85c_group03.ts';
import { BATCH85C_GROUP04_METADATA } from './catalog/batch85c_group04.ts';
import { BATCH85C_GROUP05_METADATA } from './catalog/batch85c_group05.ts';
import { BATCH85C_GROUP06_METADATA } from './catalog/batch85c_group06.ts';
import { BATCH85C_GROUP07_METADATA } from './catalog/batch85c_group07.ts';
import { BATCH85C_GROUP08_METADATA } from './catalog/batch85c_group08.ts';
import { BATCH85C_GROUP09_METADATA } from './catalog/batch85c_group09.ts';
import { BATCH85C_GROUP10_METADATA } from './catalog/batch85c_group10.ts';
import { BATCH85C_GROUP11_METADATA } from './catalog/batch85c_group11.ts';
import { BATCH85C_GROUP12_METADATA } from './catalog/batch85c_group12.ts';
import { BATCH85C_GROUP13_METADATA } from './catalog/batch85c_group13.ts';
import { BATCH85C_GROUP14_METADATA } from './catalog/batch85c_group14.ts';
import { BATCH85C_GROUP15_METADATA } from './catalog/batch85c_group15.ts';
import { BATCH85C_GROUP16_METADATA } from './catalog/batch85c_group16.ts';
import { BATCH85C_GROUP17_METADATA } from './catalog/batch85c_group17.ts';
import { BATCH85C_GROUP18_METADATA } from './catalog/batch85c_group18.ts';
import { BATCH85C_GROUP19_METADATA } from './catalog/batch85c_group19.ts';
import { BATCH85C_GROUP20_METADATA } from './catalog/batch85c_group20.ts';
import { BATCH85C_GROUP21_METADATA } from './catalog/batch85c_group21.ts';
import { BATCH85C_GROUP22_METADATA } from './catalog/batch85c_group22.ts';
import { BATCH85C_GROUP23_METADATA } from './catalog/batch85c_group23.ts';
import { BATCH85C_GROUP24_METADATA } from './catalog/batch85c_group24.ts';
import { BATCH85C_GROUP25_METADATA } from './catalog/batch85c_group25.ts';
import { BATCH85C_GROUP26_METADATA } from './catalog/batch85c_group26.ts';
import { BATCH85C_GROUP27_METADATA } from './catalog/batch85c_group27.ts';
import { BATCH85C_GROUP28_METADATA } from './catalog/batch85c_group28.ts';
import { BATCH85C_GROUP29_METADATA } from './catalog/batch85c_group29.ts';
import { BATCH85C_GROUP30_METADATA } from './catalog/batch85c_group30.ts';
import { BATCH85C_GROUP31_METADATA } from './catalog/batch85c_group31.ts';
import { BATCH85C_GROUP32_METADATA } from './catalog/batch85c_group32.ts';
import { BATCH85C_GROUP33_METADATA } from './catalog/batch85c_group33.ts';
import { BATCH85C_GROUP34_METADATA } from './catalog/batch85c_group34.ts';
import { BATCH85C_GROUP35_METADATA } from './catalog/batch85c_group35.ts';
import { BATCH85C_GROUP36_METADATA } from './catalog/batch85c_group36.ts';
import { BATCH85C_GROUP37_METADATA } from './catalog/batch85c_group37.ts';
import { BATCH85C_GROUP38_METADATA } from './catalog/batch85c_group38.ts';
import { BATCH85C_GROUP39_METADATA } from './catalog/batch85c_group39.ts';
import { BATCH85C_GROUP40_METADATA } from './catalog/batch85c_group40.ts';
import { BATCH85F_GROUP01_METADATA } from './catalog/batch85f_group01.ts';
import { BATCH85F_GROUP02_METADATA } from './catalog/batch85f_group02.ts';
import { BATCH85F_GROUP03_METADATA } from './catalog/batch85f_group03.ts';
import { BATCH85F_GROUP04_METADATA } from './catalog/batch85f_group04.ts';
import { BATCH85F_GROUP05_METADATA } from './catalog/batch85f_group05.ts';
import { BATCH85F_GROUP06_METADATA } from './catalog/batch85f_group06.ts';
import { BATCH85F_GROUP07_METADATA } from './catalog/batch85f_group07.ts';
import { BATCH85F_GROUP08_METADATA } from './catalog/batch85f_group08.ts';
import { BATCH85F_GROUP09_METADATA } from './catalog/batch85f_group09.ts';
import { BATCH85F_GROUP10_METADATA } from './catalog/batch85f_group10.ts';
import { BATCH85F_GROUP11_METADATA } from './catalog/batch85f_group11.ts';
import { BATCH85F_GROUP12_METADATA } from './catalog/batch85f_group12.ts';
import { BATCH85F_GROUP13_METADATA } from './catalog/batch85f_group13.ts';
import { BATCH85F_GROUP14_METADATA } from './catalog/batch85f_group14.ts';
import { BATCH85F_GROUP15_METADATA } from './catalog/batch85f_group15.ts';
import { BATCH85F_GROUP16_METADATA } from './catalog/batch85f_group16.ts';
import { BATCH85F_GROUP17_METADATA } from './catalog/batch85f_group17.ts';
import { BATCH85F_GROUP18_METADATA } from './catalog/batch85f_group18.ts';
import { BATCH85F_GROUP19_METADATA } from './catalog/batch85f_group19.ts';
import { BATCH85F_GROUP20_METADATA } from './catalog/batch85f_group20.ts';
import { BATCH85F_GROUP21_METADATA } from './catalog/batch85f_group21.ts';
import { BATCH85F_GROUP22_METADATA } from './catalog/batch85f_group22.ts';
import { BATCH85F_GROUP23_METADATA } from './catalog/batch85f_group23.ts';
import { BATCH85F_GROUP24_METADATA } from './catalog/batch85f_group24.ts';
import { BATCH85F_GROUP25_METADATA } from './catalog/batch85f_group25.ts';
import { BATCH85F_GROUP26_METADATA } from './catalog/batch85f_group26.ts';
import { BATCH85F_GROUP27_METADATA } from './catalog/batch85f_group27.ts';
import { BATCH85F_GROUP28_METADATA } from './catalog/batch85f_group28.ts';
import { BATCH85F_GROUP29_METADATA } from './catalog/batch85f_group29.ts';
import { BATCH85F_GROUP30_METADATA } from './catalog/batch85f_group30.ts';
import { BATCH85F_GROUP31_METADATA } from './catalog/batch85f_group31.ts';
import { BATCH85F_GROUP32_METADATA } from './catalog/batch85f_group32.ts';
import { BATCH85F_GROUP33_METADATA } from './catalog/batch85f_group33.ts';
import { BATCH85F_GROUP34_METADATA } from './catalog/batch85f_group34.ts';
import { BATCH85F_GROUP35_METADATA } from './catalog/batch85f_group35.ts';
import { BATCH85F_GROUP36_METADATA } from './catalog/batch85f_group36.ts';
import { BATCH85F_GROUP37_METADATA } from './catalog/batch85f_group37.ts';
import { BATCH85F_GROUP38_METADATA } from './catalog/batch85f_group38.ts';
import { BATCH85F_GROUP39_METADATA } from './catalog/batch85f_group39.ts';
import { BATCH85F_GROUP40_METADATA } from './catalog/batch85f_group40.ts';
import { BATCH60_METADATA, BATCH60_SUBCATEGORIES } from './catalog/batch60_phase17g_expansion.ts';
import { BATCH61_METADATA, BATCH61_SUBCATEGORIES } from './catalog/batch61_phase17h_expansion.ts';
import { BATCH62_METADATA, BATCH62_SUBCATEGORIES } from './catalog/batch62_phase17i_expansion.ts';
import { BATCH63_METADATA, BATCH63_SUBCATEGORIES } from './catalog/batch63_phase17j_expansion.ts';
import { PHASE18_METADATA, PHASE18_SUBCATEGORIES } from './catalog/phase18_technology_expansion.ts';
import { PHASE19_METADATA, PHASE19_SUBCATEGORIES } from './catalog/phase19_construction_expansion.ts';
import { PHASE20_METADATA, PHASE20_SUBCATEGORIES } from './catalog/phase20_manufacturing_expansion.ts';
import { PHASE21_METADATA, PHASE21_SUBCATEGORIES } from './catalog/phase21_science_expansion.ts';
import { PHASE22_METADATA, PHASE22_SUBCATEGORIES } from './catalog/phase22_lifestyle_expansion.ts';
import { PHASE23_METADATA, PHASE23_SUBCATEGORIES } from './catalog/phase23_business_productivity_expansion.ts';
import { PHASE25_METADATA, PHASE25_SUBCATEGORIES } from './catalog/phase25_pdf_tools_expansion.ts';
import { PHASE27_METADATA, PHASE27_SUBCATEGORIES } from './catalog/phase27_document_converters.ts';

// Raw category metadata definitions (sortOrder 1..14)
export const RAW_CATEGORIES: Omit<CategoryMeta, 'count'>[] = [
  {
    id: 'basic-math',
    slug: 'basic-math',
    title: 'Basic Math Calculators',
    subtitle: 'Percentages, fractions & arithmetic',
    description: 'Essential mathematical calculators for computing percentages, calculating differences, solving fraction arithmetic, and performing standard operations.',
    iconName: 'Percent',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'algebra',
    slug: 'algebra',
    title: 'Algebra Calculators',
    subtitle: 'Quadratic & linear equations',
    description: 'Solve polynomial, quadratic, and linear equations with step-by-step root determinations, vertex coordinates, and slope-intercept evaluations.',
    iconName: 'Binary',
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF',
    borderColor: '#EDE9FE',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'geometry',
    slug: 'geometry',
    title: 'Geometry Calculators',
    subtitle: 'Area, perimeter, volume & surface',
    description: 'Calculate 2D planar perimeter and area, alongside 3D solid volume and surface area across circles, triangles, prisms, cylinders, and spheres.',
    iconName: 'Shapes',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    borderColor: '#E0F2FE',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'trigonometry',
    slug: 'trigonometry',
    title: 'Trigonometry Calculators',
    subtitle: 'Triangles, sin, cos, tan & radians',
    description: 'Precise trigonometric angle and ratio solvers including Pythagorean theorem, right triangle relationships, and radians-to-degrees calculations.',
    iconName: 'Triangle',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA',
    borderColor: '#CCFBF1',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'statistics',
    slug: 'statistics',
    title: 'Statistics & Probability Calculators',
    subtitle: 'Mean, variance, stdev & combinations',
    description: 'Compute central tendency measures (mean, median, mode), population/sample variance, standard deviation, and combinatorics (nPr and nCr).',
    iconName: 'BarChart3',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    borderColor: '#FEF3C7',
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'scientific',
    slug: 'scientific',
    title: 'Scientific Calculators',
    subtitle: 'Exponents, logarithms & roots',
    description: 'High-precision scientific computing suite providing natural/base-10 logarithms, nth roots, exponents, scientific notation, and advanced formulas.',
    iconName: 'Atom',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    borderColor: '#D1FAE5',
    sortOrder: 6,
    isActive: true
  },
  {
    id: 'financial',
    slug: 'financial',
    title: 'Financial Calculators',
    subtitle: 'Loans, mortgages & compound interest',
    description: 'Calculate loan amortizations, monthly mortgage payments, compound interest investment growth curves, and long-term financial projections.',
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF',
    borderColor: '#F3E8FF',
    sortOrder: 7,
    isActive: true
  },
  {
    id: 'business',
    slug: 'business',
    title: 'Business Calculators',
    subtitle: 'Break-even, margins & markup',
    description: 'Analyze business profitability, determine break-even sales volume, calculate gross and net profit margins, and establish pricing markup percentages.',
    iconName: 'Briefcase',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    borderColor: '#E0E7FF',
    sortOrder: 8,
    isActive: true
  },
  {
    id: 'construction',
    slug: 'construction',
    title: 'Construction Calculators',
    subtitle: 'Concrete volume, flooring & materials',
    description: 'Accurate material estimation tools for concrete yardage, premix bags, square footage coverage, standard waste margins, and surface paint needs.',
    iconName: 'Hammer',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF',
    borderColor: '#FAE8FF',
    sortOrder: 9,
    isActive: true
  },
  {
    id: 'health-fitness',
    slug: 'health-fitness',
    title: 'Health & Fitness Calculators',
    subtitle: 'BMI, BMR, TDEE & calorie goals',
    description: 'Health metrics calculated using verified formulas including Body Mass Index (BMI) and Mifflin-St Jeor basal metabolic rate and TDEE calorie estimates.',
    iconName: 'HeartPulse',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2',
    borderColor: '#FFE4E6',
    sortOrder: 10,
    isActive: true
  },
  {
    id: 'datetime',
    slug: 'datetime',
    title: 'Date & Time Calculators',
    subtitle: 'Exact age, date difference & days',
    description: 'Chronological time calculations covering exact age in years, months and days, calendar days between dates, and business working days.',
    iconName: 'Calendar',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    borderColor: '#FFEDD5',
    sortOrder: 11,
    isActive: true
  },
  {
    id: 'electrical',
    slug: 'electrical',
    title: 'Electrical Calculators',
    subtitle: "Ohm's Law, power & energy cost",
    description: "Electrical engineering tools for Ohm's Law (V=IR), electrical power wattage (P=VI), and household appliance kilowatt-hour running costs.",
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
    borderColor: '#FEF3C7',
    sortOrder: 12,
    isActive: true
  },
  {
    id: 'engineering',
    slug: 'engineering',
    title: 'Engineering Calculators',
    subtitle: 'Hydraulics, kinetic & potential energy',
    description: 'Mechanical and fluid engineering formulas for hydraulic cylinder force, fluid pressure, mechanical kinetic energy, and gravitational potential energy.',
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF',
    borderColor: '#CFFAFE',
    sortOrder: 13,
    isActive: true
  },
  {
    id: 'everyday',
    slug: 'everyday',
    title: 'Everyday Calculators',
    subtitle: 'Tip splitting, sales tax & discounts',
    description: 'Everyday practical mathematics for calculating tips, splitting restaurant checks among guests, markdown discount pricing, and final sales taxes.',
    iconName: 'Receipt',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
    borderColor: '#DCFCE7',
    sortOrder: 14,
    isActive: true
  },
  {
    id: 'tax-accounting',
    slug: 'tax-accounting',
    title: 'Tax & Accounting Calculators',
    subtitle: 'Income tax, VAT & self-employment',
    description: 'Calculate federal income tax liability, effective tax rates, sales tax / VAT, and self-employment FICA contributions.',
    iconName: 'Receipt',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
    borderColor: '#DCFCE7',
    sortOrder: 15,
    isActive: true
  },
  {
    id: 'real-estate',
    slug: 'real-estate',
    title: 'Real Estate & Property Calculators',
    subtitle: 'Mortgage payments, cap rate & ROI',
    description: 'Analyze real estate investments, calculate monthly mortgage amortizations, rental property cap rates, and rent vs. buy outcomes.',
    iconName: 'Home',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    borderColor: '#E0F2FE',
    sortOrder: 16,
    isActive: true
  },
  {
    id: 'ecommerce',
    slug: 'ecommerce',
    title: 'E-commerce & Retail Calculators',
    subtitle: 'FBA fees, profit margins & break-even',
    description: 'Evaluate online store profitability, calculate Amazon FBA fulfillment and referral fees, profit margins, and retail break-even units.',
    iconName: 'ShoppingBag',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    borderColor: '#E0E7FF',
    sortOrder: 17,
    isActive: true
  },
  {
    id: 'energy-solar',
    slug: 'energy-solar',
    title: 'Energy & Solar Calculators',
    subtitle: 'Solar panel ROI & payback period',
    description: 'Estimate photovoltaic solar panel system energy generation, tax credit savings, net system cost, and financial payback period.',
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
    borderColor: '#FEF3C7',
    sortOrder: 18,
    isActive: true
  },
  {
    id: 'insurance-risk',
    slug: 'insurance-risk',
    title: 'Insurance & Risk Calculators',
    subtitle: 'Life insurance coverage & deductibles',
    description: 'Calculate recommended term life insurance coverage needs and compare auto insurance deductible cost trade-offs against premium savings.',
    iconName: 'ShieldCheck',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    borderColor: '#E0F2FE',
    sortOrder: 19,
    isActive: true
  },
  {
    id: 'automotive',
    slug: 'automotive',
    title: 'Automotive & Transport Calculators',
    subtitle: 'Car depreciation, loans & road trips',
    description: 'Estimate vehicle resale trade-in depreciation values over time and calculate total road trip fuel expenditures and travel splitting.',
    iconName: 'Car',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    borderColor: '#FFEDD5',
    sortOrder: 20,
    isActive: true
  },
  {
    id: 'education-finance',
    slug: 'education-finance',
    title: 'Education & Student Finance',
    subtitle: 'Student loans & 529 college savings',
    description: 'Calculate student loan amortization schedules with accelerated principal payoff and project 529 college savings compound growth.',
    iconName: 'GraduationCap',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF',
    borderColor: '#F3E8FF',
    sortOrder: 21,
    isActive: true
  },
  {
    id: 'salary-compensation',
    slug: 'salary-compensation',
    title: 'Salary & Compensation Calculators',
    subtitle: 'Hourly pay, take-home net & 401(k)',
    description: 'Convert hourly wages to annual pay and overtime, estimate net take-home salary after taxes and FICA, and project 401(k) retirement nest eggs.',
    iconName: 'DollarSign',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
    borderColor: '#DCFCE7',
    sortOrder: 22,
    isActive: true
  },
  {
    id: 'banking-savings',
    slug: 'banking-savings',
    title: 'Banking & Savings Calculators',
    subtitle: 'CD maturity, interest & compound savings',
    description: 'Calculate fixed-term Certificate of Deposit (CD) maturity values and project long-term compound savings with regular monthly deposits.',
    iconName: 'Landmark',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 23,
    isActive: true
  },
  {
    id: 'business-operations',
    slug: 'business-operations',
    title: 'Business Operations Calculators',
    subtitle: 'SaaS LTV/CAC & employee turnover',
    description: 'Evaluate customer lifetime value (LTV) against acquisition cost (CAC) and calculate workforce turnover rates and hiring replacement costs.',
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    borderColor: '#E0E7FF',
    sortOrder: 24,
    isActive: true
  },
  {
    id: 'logistics-shipping',
    slug: 'logistics-shipping',
    title: 'Logistics & Shipping Calculators',
    subtitle: 'Dimensional weight & freight rates',
    description: 'Compute billable parcel dimensional weight, evaluate shipping zones, and estimate carrier freight costs with fuel surcharges.',
    iconName: 'Box',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    borderColor: '#FFEDD5',
    sortOrder: 25,
    isActive: true
  },
  {
    id: 'manufacturing-inventory',
    slug: 'manufacturing-inventory',
    title: 'Manufacturing & Inventory Calculators',
    subtitle: 'EOQ, OEE, safety stock & turnover',
    description: 'Determine Economic Order Quantity (EOQ), measure manufacturing OEE productivity, calculate safety stock reorder points, and track inventory turnover.',
    iconName: 'Layers',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    borderColor: '#D1FAE5',
    sortOrder: 26,
    isActive: true
  },
  {
    id: 'agriculture-farming',
    slug: 'agriculture-farming',
    title: 'Agriculture & Farming Calculators',
    subtitle: 'Crop yields & N-P-K fertilizer rates',
    description: 'Estimate agricultural crop harvest output, gross market values, and calculate required N-P-K fertilizer nutrient application rates.',
    iconName: 'Sprout',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
    borderColor: '#DCFCE7',
    sortOrder: 27,
    isActive: true
  },
  {
    id: 'animal-world',
    slug: 'animal-world',
    title: 'Animal World Calculators',
    subtitle: 'Mammals, birds, reptiles & wildlife',
    description: 'Comprehensive biological group calculators for mammals, birds, reptiles, amphibians, fish, insects, arachnids, and invertebrates.',
    iconName: 'PawPrint',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    borderColor: '#D1FAE5',
    sortOrder: 28,
    isActive: true
  },
  {
    id: 'healthcare-operations',
    slug: 'healthcare-operations',
    title: 'Healthcare Operations Calculators',
    subtitle: 'Patient wait times & IV drip rates',
    description: 'Model outpatient clinic queue wait times and facility throughput, and calculate intravenous fluid infusion drop rates (gtt/min).',
    iconName: 'HeartPulse',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2',
    borderColor: '#FFE4E6',
    sortOrder: 28,
    isActive: true
  },
  {
    id: 'telecom-internet',
    slug: 'telecom-internet',
    title: 'Telecommunications & Internet',
    subtitle: 'Download transfer times & TCP bandwidth',
    description: 'Calculate exact file download transfer durations across internet speeds and estimate theoretical maximum TCP network throughput.',
    iconName: 'Wifi',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    borderColor: '#E0F2FE',
    sortOrder: 29,
    isActive: true
  },
  {
    id: 'personal-productivity',
    slug: 'personal-productivity',
    title: 'Personal Productivity & Planning',
    subtitle: 'Pomodoro, hydration, net worth & habits',
    description: 'Plan focused work blocks with Pomodoro schedulers, calculate daily hydration targets, compute personal net worth, and track habit streaks.',
    iconName: 'Clock',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF',
    borderColor: '#F3E8FF',
    sortOrder: 30,
    isActive: true
  },
  {
    id: 'environmental-sustainability',
    slug: 'environmental-sustainability',
    title: 'Environmental & Sustainability',
    subtitle: 'Carbon footprint & solar offsets',
    description: 'Estimate annual household carbon footprint and CO2 offsets from rooftop solar systems.',
    iconName: 'Leaf',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
    borderColor: '#DCFCE7',
    sortOrder: 31,
    isActive: true
  },
  {
    id: 'food-service',
    slug: 'food-service',
    title: 'Food Service & Hospitality',
    subtitle: 'Recipe costing & table turnover',
    description: 'Compute recipe plate costs, food cost percentages, menu pricing, and restaurant table turnover capacity.',
    iconName: 'Utensils',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    borderColor: '#FEF3C7',
    sortOrder: 32,
    isActive: true
  },
  {
    id: 'aviation-transport',
    slug: 'aviation-transport',
    title: 'Aviation & Transportation',
    subtitle: 'Ground speed & flight fuel range',
    description: 'Calculate aircraft true airspeed, wind correction angles, fuel burn rates, and maximum flight range.',
    iconName: 'Plane',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    borderColor: '#E0F2FE',
    sortOrder: 33,
    isActive: true
  },
  {
    id: 'cybersecurity-data',
    slug: 'cybersecurity-data',
    title: 'Cybersecurity & Data Management',
    subtitle: 'Password entropy, S3 costs & RAID',
    description: 'Estimate password brute-force crack time entropy, cloud S3 storage costs, RAID array capacities, and data center PUE.',
    iconName: 'Shield',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF',
    borderColor: '#F3E8FF',
    sortOrder: 34,
    isActive: true
  },
  {
    id: 'legal-compliance',
    slug: 'legal-compliance',
    title: 'Legal & Compliance',
    subtitle: 'NDA damages & GDPR DSAR costs',
    description: 'Estimate trade secret misappropriation damages, enforceable liquidated damages caps, and GDPR DSAR compliance operational costs.',
    iconName: 'Scale',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 35,
    isActive: true
  },
  {
    id: 'real-estate-dev',
    slug: 'real-estate-dev',
    title: 'Real Estate Development',
    subtitle: 'Commercial cap rates & land residual',
    description: 'Compute commercial real estate Net Operating Income (NOI), Capitalization Rates (Cap Rates), and real estate land residual acquisition values.',
    iconName: 'Building',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    borderColor: '#D1FAE5',
    sortOrder: 36,
    isActive: true
  },
  {
    id: 'retail-supply-chain',
    slug: 'retail-supply-chain',
    title: 'Retail & Supply Chain',
    subtitle: 'Open-to-buy planning & stockout costs',
    description: 'Calculate retail Open-to-Buy inventory budgets and quantify financial losses and lost profits from stockout events.',
    iconName: 'Store',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    borderColor: '#FEF3C7',
    sortOrder: 37,
    isActive: true
  },
  {
    id: 'sports-athletics',
    slug: 'sports-athletics',
    title: 'Sports & Athletics Performance',
    subtitle: 'Running prediction, FTP, CSS & baseball stats',
    description: 'Predict running race finish times via Riegel formula, calculate cycling FTP training zones, swimming Critical Swim Speed (CSS), and baseball sabermetrics.',
    iconName: 'Trophy',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
    borderColor: '#FEE2E2',
    sortOrder: 38,
    isActive: true
  },
  {
    id: 'converter',
    slug: 'converter',
    title: 'Unit Converter & Measurement Tools',
    subtitle: 'Length, weight, temperature & volume',
    description: 'Convert values and dimensional units across length, mass, temperature, area, volume, speed, pressure, digital data storage, and energy with instant multi-unit formulas.',
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    borderColor: '#E0F2FE',
    sortOrder: 39,
    isActive: true
  },
  {
    id: 'tools',
    slug: 'tools',
    title: 'Developer & Everyday Digital Tools',
    subtitle: 'Text, dev, date/time, image & web utilities',
    description: 'Comprehensive digital toolkit featuring word and character counters, text case converters, JSON formatters, Base64 processors, hash generators, regex matchers, timestamps, aspect ratios, color pickers, and QR formatters.',
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 40,
    isActive: true
  },
  {
    id: 'generators',
    slug: 'generators',
    title: 'Generators & Utilities',
    subtitle: 'Passwords, QR codes, UUIDs & hashes',
    description: 'Instant digital generators for secure passwords, high-resolution QR codes, unique UUIDs, random numbers, placeholder text, cryptographic hashes, Base64 codecs, and color palettes.',
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF',
    borderColor: '#F3E8FF',
    sortOrder: 41,
    isActive: true
  },
  {
    id: 'planners',
    slug: 'planners',
    title: 'Planners & Organizers',
    subtitle: 'Budgets, meals, travel, schedules & tasks',
    description: 'Comprehensive digital planners for monthly budgeting, weekly meals, grocery lists, travel itineraries, house moving, daily schedules, weekly tasks, event budgets, home maintenance, and study schedules.',
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    borderColor: '#D1FAE5',
    sortOrder: 42,
    isActive: true
  },
  {
    id: 'checkers',
    slug: 'checkers',
    title: 'Checkers & Validators',
    subtitle: 'JSON, emails, URLs, IBAN, passwords & regex',
    description: 'Developer and security utility checkers for validating JSON syntax, email addresses, URLs, IBAN bank accounts, password strength, IP CIDR subnets, credit card Luhn algorithms, HTML tags, RegEx, and ISBN barcodes.',
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 43,
    isActive: true
  },
  {
    id: 'trackers',
    slug: 'trackers',
    title: 'Trackers & Metrics',
    subtitle: 'Water, habits, expenses, workouts & sleep',
    description: 'Personal growth and health trackers for water intake, habit streaks, expenses & savings, workout fitness, sleep duration, calorie macros, body weight, task milestones, mood wellness, and reading progress.',
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    borderColor: '#D1FAE5',
    sortOrder: 44,
    isActive: true
  },
  {
    id: 'guides',
    slug: 'guides',
    title: 'Guides & References',
    subtitle: 'Periodic table, cheat sheets, syntax & status codes',
    description: 'Comprehensive reference guides and cheat sheets covering chemical elements, math formulas, HTTP status codes, Markdown, ASCII/Unicode, CSS Flex/Grid, unit conversion factors, programming syntax, SQL commands, and paper sizes.',
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 45,
    isActive: true
  },
  {
    id: 'additional-tools',
    slug: 'additional-tools',
    title: 'Additional Tools & Utilities',
    subtitle: 'JSON/CSV, diffs, JWTs, gradients & timestamps',
    description: 'Advanced developer and utility tools including JSON/CSV data converters, text diff checkers, URL/JWT encoders, epoch timestamp converters, CSS gradient designers, HTML entity encoders, XML parsers, CRON explainers, and image resolution calculators.',
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 46,
    isActive: true
  },
  {
    id: 'pdf-tools',
    slug: 'pdf-tools',
    title: 'PDF Document Suite',
    subtitle: 'Merge, split, watermark, encrypt & convert PDFs',
    description: 'Comprehensive browser-local PDF processing suite for merging, splitting, watermarking, compressing, encrypting, converting, and analyzing PDF documents securely.',
    iconName: 'FileText',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
    borderColor: '#FEE2E2',
    sortOrder: 47,
    isActive: true
  },
  {
    id: 'document-converters',
    slug: 'document-converters',
    title: 'Document Converters',
    subtitle: 'PDF, Word, Excel, PowerPoint, HTML, Markdown & ODF',
    description: 'Convert between PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), HTML, CSV, RTF, Markdown, OpenDocument (ODT/ODS/ODP), and images 100% locally in your browser.',
    iconName: 'ArrowRightLeft',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 48,
    isActive: true
  },
  {
    id: 'education-science',
    slug: 'education-science',
    title: 'Science & Education Calculators',
    subtitle: 'Simulators, physics, astronomy & chemistry',
    description: 'Advanced scientific simulation and educational calculation tools covering orbital mechanics, fluid reservoirs, quantum gates, and thermodynamics.',
    iconName: 'GraduationCap',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    borderColor: '#DBEAFE',
    sortOrder: 49,
    isActive: true
  },
  {
    id: 'developer-it',
    slug: 'developer-it',
    title: 'Developer & IT Infrastructure Utilities',
    subtitle: 'Cloud costs, optimization, indexing & bundle sizes',
    description: 'Professional development and IT engineering calculators for cloud S3 storage costs, database indexing, web tree-shaking, and rate-limiting memory footprints.',
    iconName: 'Terminal',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF',
    borderColor: '#F3E8FF',
    sortOrder: 50,
    isActive: true
  },
  {
    id: 'text-writing',
    slug: 'text-writing',
    title: 'Text & Writing Analysis Tools',
    subtitle: 'Readability, documents, Markdown & WPM',
    description: 'Specialized text analysis and writing tools for readability scoring, reading/speaking pace estimation, document editing, and Markdown formatting.',
    iconName: 'FileEdit',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA',
    borderColor: '#CCFBF1',
    sortOrder: 51,
    isActive: true
  }
];

// Exactly 56 Approved Subcategories (4 per category x 14 categories = 56)
export const RAW_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  // 1. Basic Math (4)
  {
    id: 'percentages-fractions',
    categoryId: 'basic-math',
    name: 'Percentages & Fractions',
    slug: 'percentages-fractions',
    description: 'Percentage of numbers, percentage change, and fraction simplification',
    sortOrder: 1
  },
  {
    id: 'arithmetic-operations',
    categoryId: 'basic-math',
    name: 'Arithmetic & Operations',
    slug: 'arithmetic',
    description: 'Fundamental arithmetic, order of operations, and integer calculations',
    sortOrder: 2
  },
  {
    id: 'ratios-proportions',
    categoryId: 'basic-math',
    name: 'Ratios & Proportions',
    slug: 'ratios-proportions',
    description: 'Direct proportions, inverse proportions, and equivalent ratios',
    sortOrder: 3
  },
  {
    id: 'rounding-estimation',
    categoryId: 'basic-math',
    name: 'Rounding & Estimation',
    slug: 'rounding-estimation',
    description: 'Decimal precision rounding, significant digits, and numerical estimation',
    sortOrder: 4
  },

  // 2. Algebra (4)
  {
    id: 'quadratic-equations',
    categoryId: 'algebra',
    name: 'Quadratic Equations',
    slug: 'quadratic',
    description: 'Quadratic equation formula, real and complex roots, and parabola vertex',
    sortOrder: 1
  },
  {
    id: 'linear-equations',
    categoryId: 'algebra',
    name: 'Linear Equations',
    slug: 'linear',
    description: 'Slope-intercept form (y=mx+b), two-point lines, and Cartesian coordinates',
    sortOrder: 2
  },
  {
    id: 'polynomials-factoring',
    categoryId: 'algebra',
    name: 'Polynomials & Factoring',
    slug: 'polynomials',
    description: 'Polynomial expansion, factorization, and polynomial root finders',
    sortOrder: 3
  },
  {
    id: 'systems-inequalities',
    categoryId: 'algebra',
    name: 'Systems & Inequalities',
    slug: 'systems',
    description: 'Systems of simultaneous linear equations and mathematical inequalities',
    sortOrder: 4
  },

  // 3. Geometry (4)
  {
    id: 'plane-geometry-area',
    categoryId: 'geometry',
    name: '2D Area & Perimeter',
    slug: 'area-perimeter',
    description: 'Perimeter and surface area of circles, rectangles, triangles, and polygons',
    sortOrder: 1
  },
  {
    id: 'solid-geometry-volume',
    categoryId: 'geometry',
    name: '3D Volume & Surface Area',
    slug: 'volume-surface',
    description: 'Volume and total surface area of cylinders, spheres, cones, and prisms',
    sortOrder: 2
  },
  {
    id: 'circles-arcs',
    categoryId: 'geometry',
    name: 'Circles & Arcs',
    slug: 'circles-arcs',
    description: 'Circle radius, diameter, arc length, sector area, and chord lengths',
    sortOrder: 3
  },
  {
    id: 'coordinate-geometry',
    categoryId: 'geometry',
    name: 'Coordinate Geometry',
    slug: 'coordinate',
    description: 'Midpoint formulas, distance between points, and geometric projections',
    sortOrder: 4
  },

  // 4. Trigonometry (4)
  {
    id: 'right-triangles',
    categoryId: 'trigonometry',
    name: 'Right Triangles & Pythagorean',
    slug: 'right-triangles',
    description: 'Pythagorean theorem (a²+b²=c²), hypotenuse lengths, and right triangle sides',
    sortOrder: 1
  },
  {
    id: 'trig-functions',
    categoryId: 'trigonometry',
    name: 'Trigonometric Functions',
    slug: 'functions',
    description: 'Sine, cosine, tangent, secant, cosecant, cotangent in degrees and radians',
    sortOrder: 2
  },
  {
    id: 'oblique-triangles',
    categoryId: 'trigonometry',
    name: 'Oblique Triangles',
    slug: 'oblique-triangles',
    description: 'Law of Sines, Law of Cosines, and non-right triangle geometry',
    sortOrder: 3
  },
  {
    id: 'identities-harmonics',
    categoryId: 'trigonometry',
    name: 'Identities & Angle Formulas',
    slug: 'identities',
    description: 'Double angle, half angle, and trigonometric identities',
    sortOrder: 4
  },

  // 5. Statistics & Probability (4)
  {
    id: 'descriptive-statistics',
    categoryId: 'statistics',
    name: 'Descriptive Statistics',
    slug: 'descriptive',
    description: 'Mean, median, mode, sample/population variance, and standard deviation',
    sortOrder: 1
  },
  {
    id: 'combinatorics-probability',
    categoryId: 'statistics',
    name: 'Combinatorics & Probability',
    slug: 'combinatorics',
    description: 'Permutations (nPr), combinations (nCr), factorials, and event probability',
    sortOrder: 2
  },
  {
    id: 'distributions',
    categoryId: 'statistics',
    name: 'Statistical Distributions',
    slug: 'distributions',
    description: 'Normal distribution curve, z-score calculations, and confidence intervals',
    sortOrder: 3
  },
  {
    id: 'regression-correlation',
    categoryId: 'statistics',
    name: 'Correlation & Regression',
    slug: 'regression',
    description: 'Pearson correlation coefficient and linear least-squares regression',
    sortOrder: 4
  },

  // 6. Scientific (4)
  {
    id: 'powers-exponents',
    categoryId: 'scientific',
    name: 'Powers & Exponents',
    slug: 'powers-exponents',
    description: 'Exponentials, nth roots, scientific notation, and power reductions',
    sortOrder: 1
  },
  {
    id: 'logarithms',
    categoryId: 'scientific',
    name: 'Logarithms',
    slug: 'logarithms',
    description: 'Natural logarithm (ln), common logarithm (log10), and arbitrary base logs',
    sortOrder: 2
  },
  {
    id: 'precision-scientific',
    categoryId: 'scientific',
    name: 'Precision Scientific Engine',
    slug: 'precision',
    description: 'High-precision multi-operator scientific arithmetic and transcendental functions',
    sortOrder: 3
  },
  {
    id: 'constants-sequences',
    categoryId: 'scientific',
    name: 'Constants & Sequences',
    slug: 'constants',
    description: 'Mathematical constants (pi, e, phi) and arithmetic/geometric progression sums',
    sortOrder: 4
  },

  // 7. Financial (4)
  {
    id: 'loans-mortgages',
    categoryId: 'financial',
    name: 'Loans & Mortgages',
    slug: 'mortgage',
    description: 'Monthly loan payments, mortgage amortization schedules, and interest totals',
    sortOrder: 1
  },
  {
    id: 'compound-investments',
    categoryId: 'financial',
    name: 'Compound Interest & Investments',
    slug: 'investing',
    description: 'Compound interest growth, regular deposits, and future value calculations',
    sortOrder: 2
  },
  {
    id: 'retirement-savings',
    categoryId: 'financial',
    name: 'Retirement & Savings',
    slug: 'retirement',
    description: 'Nest egg accumulation, annuity payout schedules, and retirement goals',
    sortOrder: 3
  },
  {
    id: 'depreciation-tax',
    categoryId: 'financial',
    name: 'Depreciation & Capital',
    slug: 'depreciation',
    description: 'Asset straight-line depreciation, declining balance, and capital math',
    sortOrder: 4
  },

  // 8. Business (4)
  {
    id: 'break-even-analysis',
    categoryId: 'business',
    name: 'Break-Even Analysis',
    slug: 'break-even',
    description: 'Calculate break-even unit sales volume and revenue based on costs',
    sortOrder: 1
  },
  {
    id: 'profit-margins-markup',
    categoryId: 'business',
    name: 'Profit Margins & Markup',
    slug: 'margins',
    description: 'Gross profit margin %, net profit margin %, and cost markup pricing',
    sortOrder: 2
  },
  {
    id: 'roi-npv',
    categoryId: 'business',
    name: 'ROI & Return on Investment',
    slug: 'roi',
    description: 'Return on investment percentages and investment payback period',
    sortOrder: 3
  },
  {
    id: 'valuation-ratios',
    categoryId: 'business',
    name: 'Financial Ratios & Metrics',
    slug: 'valuation',
    description: 'Key business ratios: liquidity, debt-to-equity, and operating ratios',
    sortOrder: 4
  },

  // 9. Construction (4)
  {
    id: 'concrete-masonry',
    categoryId: 'construction',
    name: 'Concrete & Masonry',
    slug: 'concrete',
    description: 'Concrete slab volume in cubic yards and pre-mixed bag quantities',
    sortOrder: 1
  },
  {
    id: 'flooring-materials',
    categoryId: 'construction',
    name: 'Flooring & Tile',
    slug: 'flooring',
    description: 'Square footage flooring area, pattern waste factor %, and box quantities',
    sortOrder: 2
  },
  {
    id: 'framing-lumber',
    categoryId: 'construction',
    name: 'Framing & Lumber',
    slug: 'framing',
    description: 'Wall stud spacing, drywall sheets, and lumber board feet calculations',
    sortOrder: 3
  },
  {
    id: 'paint-roofing',
    categoryId: 'construction',
    name: 'Paint & Surface Coating',
    slug: 'roofing',
    description: 'Net wall surface area, coverage yield, and paint gallon requirements',
    sortOrder: 4
  },

  // 10. Health & Fitness (4)
  {
    id: 'body-composition',
    categoryId: 'health-fitness',
    name: 'Body Composition & Mass',
    slug: 'body-mass',
    description: 'Body Mass Index (BMI) assessment and clinical weight categories',
    sortOrder: 1
  },
  {
    id: 'metabolic-energy',
    categoryId: 'health-fitness',
    name: 'Metabolic Rate & Energy',
    slug: 'calories',
    description: 'Mifflin-St Jeor Basal Metabolic Rate (BMR) and daily TDEE energy needs',
    sortOrder: 2
  },
  {
    id: 'target-heart-rate',
    categoryId: 'health-fitness',
    name: 'Target Heart Rate',
    slug: 'heart-rate',
    description: 'Maximum heart rate and Karvonen aerobic/anaerobic target heart rate zones',
    sortOrder: 3
  },
  {
    id: 'macronutrients-nutrition',
    categoryId: 'health-fitness',
    name: 'Macronutrients & Diet Math',
    slug: 'macronutrients',
    description: 'Macronutrient calorie-to-gram distribution across protein, carbs, and fats',
    sortOrder: 4
  },

  // 11. Date & Time (4)
  {
    id: 'chronological-age',
    categoryId: 'datetime',
    name: 'Chronological Age',
    slug: 'age',
    description: 'Exact age in years, months, days, total hours, and birthday milestones',
    sortOrder: 1
  },
  {
    id: 'date-math-differences',
    categoryId: 'datetime',
    name: 'Date Differences & Math',
    slug: 'date-difference',
    description: 'Elapsed calendar days, weeks, and duration spans between two dates',
    sortOrder: 2
  },
  {
    id: 'business-working-days',
    categoryId: 'datetime',
    name: 'Business & Working Days',
    slug: 'business-days',
    description: 'Working days between dates excluding weekend days and statutory holidays',
    sortOrder: 3
  },
  {
    id: 'time-durations',
    categoryId: 'datetime',
    name: 'Time Durations & Clock Math',
    slug: 'time-duration',
    description: 'Time addition, hour and minute elapsed duration, and decimal time',
    sortOrder: 4
  },

  // 12. Electrical (4)
  {
    id: 'ohms-law-power',
    categoryId: 'electrical',
    name: "Ohm's Law & Power",
    slug: 'ohms-law',
    description: "Voltage (V), Current (I), Resistance (R), and Electrical Power (P=VI)",
    sortOrder: 1
  },
  {
    id: 'energy-consumption',
    categoryId: 'electrical',
    name: 'Energy Consumption & Cost',
    slug: 'energy-cost',
    description: 'Kilowatt-hour (kWh) appliance energy usage and utility operating costs',
    sortOrder: 2
  },
  {
    id: 'wire-sizing-drop',
    categoryId: 'electrical',
    name: 'Voltage Drop & Resistance',
    slug: 'voltage-drop',
    description: 'Conductor length voltage drop percentage and circuit wire sizing',
    sortOrder: 3
  },
  {
    id: 'circuits-impedance',
    categoryId: 'electrical',
    name: 'Series & Parallel Circuits',
    slug: 'circuits',
    description: 'Equivalent series/parallel resistance and capacitive/inductive reactance',
    sortOrder: 4
  },

  // 13. Engineering (4)
  {
    id: 'hydraulics-fluid',
    categoryId: 'engineering',
    name: 'Hydraulics & Fluid Power',
    slug: 'hydraulics',
    description: 'Hydraulic cylinder piston force, fluid pressure (P=F/A), and flow area',
    sortOrder: 1
  },
  {
    id: 'mechanics-energy',
    categoryId: 'engineering',
    name: 'Mechanics & Energy',
    slug: 'mechanics',
    description: 'Kinetic energy (KE=½mv²), gravitational potential energy (PE=mgh), and work',
    sortOrder: 2
  },
  {
    id: 'structural-beam',
    categoryId: 'engineering',
    name: 'Structural Beam Mechanics',
    slug: 'structural',
    description: 'Beam bending moment, stress distribution (sigma=My/I), and deflection',
    sortOrder: 3
  },
  {
    id: 'thermodynamics',
    categoryId: 'engineering',
    name: 'Thermodynamics & Heat',
    slug: 'thermodynamics',
    description: 'Heat capacity transfer (Q=mcΔT) and solid material thermal expansion',
    sortOrder: 4
  },

  // 14. Everyday (4)
  {
    id: 'dining-tipping',
    categoryId: 'everyday',
    name: 'Dining & Tip Splitting',
    slug: 'tipping',
    description: 'Restaurant gratuity percentage, bill total, and per-guest cost splitting',
    sortOrder: 1
  },
  {
    id: 'shopping-discounts',
    categoryId: 'everyday',
    name: 'Shopping Discounts & Tax',
    slug: 'discounts',
    description: 'Sale discount markdown savings, combined discounts, and sales tax rate',
    sortOrder: 2
  },
  {
    id: 'automotive-fuel',
    categoryId: 'everyday',
    name: 'Fuel Economy & Trip Cost',
    slug: 'fuel-economy',
    description: 'Fuel consumption (MPG / L/100km), fuel price, and travel expenditure',
    sortOrder: 3
  },
  {
    id: 'cooking-baking-ratios',
    categoryId: 'everyday',
    name: 'Recipe & Baking Ratios',
    slug: 'recipe-scaling',
    description: 'Culinary ingredient scaling, batch multipliers, and bakers percentages',
    sortOrder: 4
  },
  ...BATCH11_SUBCATEGORIES,
  ...BATCH12_SUBCATEGORIES,
  ...BATCH13_SUBCATEGORIES,
  ...BATCH14_SUBCATEGORIES,
  ...BATCH15_SUBCATEGORIES,
  ...BATCH16_SUBCATEGORIES,
  ...BATCH17_SUBCATEGORIES,
  ...BATCH18_SUBCATEGORIES,
  ...BATCH19_SUBCATEGORIES,
  ...BATCH20_SUBCATEGORIES,
  ...BATCH21_SUBCATEGORIES,
  ...BATCH22_SUBCATEGORIES,
  ...BATCH23_SUBCATEGORIES,
  ...BATCH24_SUBCATEGORIES,
  ...BATCH25_SUBCATEGORIES,
  ...BATCH26_SUBCATEGORIES,
  ...BATCH27_SUBCATEGORIES,
  ...BATCH28_SUBCATEGORIES,
  ...BATCH29_SUBCATEGORIES,
  ...BATCH30_SUBCATEGORIES,
  ...BATCH31_SUBCATEGORIES,
  ...BATCH32_SUBCATEGORIES,
  ...BATCH33_SUBCATEGORIES,
  ...BATCH34_SUBCATEGORIES,
  ...BATCH35_SUBCATEGORIES,
  ...BATCH36_SUBCATEGORIES,
  ...BATCH37_SUBCATEGORIES,
  ...BATCH38_SUBCATEGORIES,
  ...BATCH39_SUBCATEGORIES,
  ...BATCH40_SUBCATEGORIES,
  ...BATCH41_SUBCATEGORIES,
  ...BATCH42_SUBCATEGORIES,
  ...BATCH43_SUBCATEGORIES,
  ...BATCH44_SUBCATEGORIES,
  ...BATCH45_SUBCATEGORIES,
  ...BATCH46_SUBCATEGORIES,
  ...BATCH47_SUBCATEGORIES,
  ...BATCH48_SUBCATEGORIES,
  ...BATCH49_SUBCATEGORIES,
  ...BATCH50_SUBCATEGORIES,
  ...BATCH51_SUBCATEGORIES,
  ...BATCH52_SUBCATEGORIES,
  ...BATCH53_SUBCATEGORIES,
  ...BATCH54_SUBCATEGORIES,
  ...BATCH55_SUBCATEGORIES,
  ...BATCH56_SUBCATEGORIES,
  ...BATCH57_SUBCATEGORIES,
  ...BATCH58_SUBCATEGORIES,
  ...BATCH59_SUBCATEGORIES,
  ...BATCH60_SUBCATEGORIES,
  ...BATCH61_SUBCATEGORIES,
  ...BATCH62_SUBCATEGORIES,
  ...BATCH63_SUBCATEGORIES,
  ...PHASE18_SUBCATEGORIES,
  ...PHASE19_SUBCATEGORIES,
  ...PHASE20_SUBCATEGORIES,
  ...PHASE21_SUBCATEGORIES,
  ...PHASE22_SUBCATEGORIES,
  ...PHASE23_SUBCATEGORIES,
  ...PHASE25_SUBCATEGORIES,
  ...PHASE27_SUBCATEGORIES,
  ...BATCH70_SUBCATEGORIES
];

// Preserved Existing Calculators (Exact IDs preserved, mapped to primary category + subcategory)
const BASE_24_CALCULATORS: CalculatorMeta[] = [
  // 1. Basic Math
  {
    id: 'percentage',
    name: 'Percentage & Fraction Calculator',
    shortDesc: 'Percentage of values, percent increase/decrease, fraction reduction',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    tags: ['math', 'percentage', 'fraction', 'percent-change', 'ratio', 'arithmetic'],
    formula: 'P = (X × Y) / 100',
    isPopular: false,
    iconName: 'Percent',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 2. Algebra
  {
    id: 'quadratic',
    name: 'Quadratic Equation Solver',
    shortDesc: 'Real & complex roots, discriminant, and parabola vertex',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    tags: ['algebra', 'quadratic', 'equation', 'roots', 'parabola', 'discriminant', 'vertex'],
    formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
    isPopular: false,
    iconName: 'Binary',
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF'
  },
  {
    id: 'slope-intercept',
    name: 'Slope-Intercept Linear Calculator',
    shortDesc: 'Linear equation y = mx + b, slope, intercept, and 2-point distance',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    tags: ['algebra', 'linear', 'slope', 'intercept', 'distance', 'line', 'coordinate'],
    formula: 'm = (y₂ - y₁) / (x₂ - x₁), y = mx + b',
    isPopular: false,
    iconName: 'Binary',
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF'
  },
  // 3. Geometry
  {
    id: 'area-shapes',
    name: 'Area & Perimeter Calculator',
    shortDesc: 'Calculate area and perimeter of 2D geometric shapes',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    tags: ['geometry', 'area', 'perimeter', 'circle', 'rectangle', 'triangle', 'square'],
    formula: 'Rectangle A = lw, Circle A = πr², Triangle A = ½bh',
    isPopular: true,
    iconName: 'Shapes',
    iconColor: '#0284C7',
    iconBg: '#E0F2FE'
  },
  {
    id: 'volume-surface',
    name: 'Volume & Surface Area Calculator',
    shortDesc: 'Cylinder, sphere, cone, and rectangular prism volume',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    tags: ['geometry', 'volume', 'surface-area', 'cylinder', 'sphere', 'cone', 'prism'],
    formula: 'V = πr²h, V = (4/3)πr³, V = lwh',
    isPopular: false,
    iconName: 'Shapes',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. Trigonometry
  {
    id: 'pythagorean',
    name: 'Pythagorean Theorem Calculator',
    shortDesc: 'Hypotenuse, side lengths, and area of right triangles',
    category: 'trigonometry',
    subcategoryId: 'right-triangles',
    tags: ['trigonometry', 'pythagorean', 'triangle', 'hypotenuse', 'right-triangle'],
    formula: 'a² + b² = c²',
    isPopular: false,
    iconName: 'Triangle',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  {
    id: 'trig-solver',
    name: 'Trigonometric Functions Calculator',
    shortDesc: 'Sin, cos, tan, csc, sec, cot in degrees and radians',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    tags: ['trigonometry', 'sine', 'cosine', 'tangent', 'radians', 'degrees', 'trig'],
    formula: 'sin(θ) = opp/hyp, cos(θ) = adj/hyp, tan(θ) = opp/adj',
    isPopular: false,
    iconName: 'Triangle',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  // 5. Statistics & Probability
  {
    id: 'stats-summary',
    name: 'Statistics & Probability Calculator',
    shortDesc: 'Mean, median, mode, variance, stdev, permutations (nPr) & combinations (nCr)',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    tags: ['statistics', 'mean', 'median', 'mode', 'standard-deviation', 'variance', 'probability', 'nPr', 'nCr'],
    formula: 'μ = Σx / N, σ = √(Σ(x - μ)² / N)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 6. Scientific
  {
    id: 'scientific-calc',
    name: 'Scientific Calculator',
    shortDesc: 'Powers, roots, logarithms, trigonometric functions and precision math',
    category: 'scientific',
    subcategoryId: 'precision-scientific',
    tags: ['scientific', 'logarithm', 'exponent', 'roots', 'powers', 'math'],
    formula: 'f(x) = { log, ln, x^y, √x, sin, cos, tan }',
    isPopular: false,
    iconName: 'Atom',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Financial
  {
    id: 'loan-mortgage',
    name: 'Loan & Mortgage Calculator',
    shortDesc: 'Monthly payment, total interest, and full amortization schedule',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    tags: ['finance', 'loan', 'mortgage', 'payment', 'interest', 'amortization'],
    formula: 'M = P[r(1+r)ⁿ] / [(1+r)ⁿ - 1]',
    isPopular: true,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#F3E8FF'
  },
  {
    id: 'compound-interest',
    name: 'Compound Interest Calculator',
    shortDesc: 'Future investment value with monthly contributions and compounding periods',
    category: 'financial',
    subcategoryId: 'compound-investments',
    tags: ['finance', 'investment', 'compound-interest', 'future-value', 'savings'],
    formula: 'A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 8. Business
  {
    id: 'break-even',
    name: 'Break-Even Analysis Calculator',
    shortDesc: 'Break-even volume in units and revenue based on fixed and variable costs',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    tags: ['business', 'break-even', 'fixed-cost', 'variable-cost', 'units', 'revenue'],
    formula: 'Break-even Units = Fixed Costs / (Price - Variable Cost)',
    isPopular: false,
    iconName: 'Briefcase',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'profit-margin',
    name: 'Profit Margin & Markup Calculator',
    shortDesc: 'Gross profit margin, net profit margin, and price markup percentage',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    tags: ['business', 'margin', 'markup', 'gross-profit', 'net-profit', 'revenue', 'pricing'],
    formula: 'Margin = (Revenue - COGS) / Revenue × 100%',
    isPopular: false,
    iconName: 'Briefcase',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 9. Construction
  {
    id: 'construction-calc',
    name: 'Construction Material & Concrete Calculator',
    shortDesc: 'Concrete slab volume, flooring coverage with waste %, and paint surface',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    tags: ['construction', 'concrete', 'flooring', 'paint', 'materials', 'yardage', 'tiles'],
    formula: 'Volume = L × W × D, Bags = Volume / Yield',
    isPopular: false,
    iconName: 'Hammer',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 10. Health & Fitness
  {
    id: 'bmi',
    name: 'BMI Calculator',
    shortDesc: 'Body mass index and healthy weight classification',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    tags: ['health', 'bmi', 'weight', 'height', 'body-mass-index', 'fitness'],
    formula: 'BMI = weight (kg) / [height (m)]²',
    isPopular: true,
    iconName: 'Gauge',
    iconColor: '#16A34A',
    iconBg: '#DCFCE7'
  },
  {
    id: 'bmr-tdee',
    name: 'BMR & TDEE Calorie Calculator',
    shortDesc: 'Basal metabolic rate and total daily energy expenditure targets',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    tags: ['health', 'bmr', 'tdee', 'calories', 'metabolism', 'nutrition', 'energy'],
    formula: 'BMR = 10w + 6.25h - 5a + s (Mifflin-St Jeor)',
    isPopular: false,
    iconName: 'HeartPulse',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  // 11. Date & Time
  {
    id: 'exact-age',
    name: 'Age Calculator',
    shortDesc: 'Exact age in years, months, days, total hours, and next birthday countdown',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    tags: ['date', 'time', 'age', 'birthday', 'chronological', 'years', 'months'],
    formula: 'Age = Target Date - Date of Birth',
    isPopular: true,
    iconName: 'Calendar',
    iconColor: '#EA580C',
    iconBg: '#FFEDD5'
  },
  {
    id: 'date-difference',
    name: 'Date Difference & Business Days Calculator',
    shortDesc: 'Calendar days, business working days, and date offsetting',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    tags: ['date', 'time', 'difference', 'days-between', 'business-days', 'calendar'],
    formula: 'Δt = Date₂ - Date₁ (excluding weekend days)',
    isPopular: false,
    iconName: 'Calendar',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  // 12. Electrical
  {
    id: 'ohms-law',
    name: "Ohm's Law & Power Calculator",
    shortDesc: 'Voltage, current, resistance, and electrical power calculation',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    tags: ['electrical', 'ohms-law', 'voltage', 'current', 'resistance', 'power', 'watts'],
    formula: 'V = I × R, P = V × I = I²R',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'electricity-cost',
    name: 'Electricity Appliance Cost Calculator',
    shortDesc: 'Daily, monthly, and annual operating costs from wattage and kWh rate',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    tags: ['electrical', 'energy', 'appliance', 'cost', 'kwh', 'electricity-bill'],
    formula: 'Cost = (Watts × Hours / 1000) × kWh Price',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 13. Engineering
  {
    id: 'hydraulic-force',
    name: 'Hydraulic Cylinder Force Calculator',
    shortDesc: 'Cylinder output force and pressure from piston bore diameter',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    tags: ['engineering', 'hydraulics', 'force', 'pressure', 'cylinder', 'piston'],
    formula: 'Force = Pressure × Area = P × π(d/2)²',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'kinetic-energy',
    name: 'Kinetic & Potential Energy Calculator',
    shortDesc: 'Mechanical kinetic energy and gravitational potential energy',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    tags: ['engineering', 'physics', 'kinetic-energy', 'potential-energy', 'velocity', 'mass'],
    formula: 'KE = ½mv², PE = mgh',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 14. Everyday
  {
    id: 'tip-split',
    name: 'Tip & Bill Split Calculator',
    shortDesc: 'Tip amount and per-person bill split calculation',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    tags: ['everyday', 'tip', 'bill-split', 'restaurant', 'dining', 'gratuity'],
    formula: 'Tip = Bill × (t/100), Share = (Bill + Tip) / N',
    isPopular: false,
    iconName: 'Receipt',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'discount-tax',
    name: 'Discount & Sales Tax Calculator',
    shortDesc: 'Final price, net savings, and sales tax calculation',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    tags: ['everyday', 'discount', 'sales-tax', 'shopping', 'markdown', 'savings'],
    formula: 'Final = (Original - Discount) × (1 + Tax Rate)',
    isPopular: false,
    iconName: 'Receipt',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  }
];

const RAW_CALCULATORS: CalculatorMeta[] = [
  ...BASE_24_CALCULATORS,
  ...BATCH1_METADATA,
  ...BATCH2_METADATA,
  ...BATCH3_METADATA,
  ...BATCH4_METADATA,
  ...BATCH5_METADATA,
  ...BATCH6_METADATA,
  ...BATCH7_METADATA,
  ...BATCH8_METADATA,
  ...BATCH9_METADATA,
  ...BATCH10_METADATA,
  ...BATCH11_METADATA,
  ...BATCH12_METADATA,
  ...BATCH13_METADATA,
  ...BATCH14_METADATA,
  ...BATCH15_METADATA,
  ...BATCH16_METADATA,
  ...BATCH17_METADATA,
  ...BATCH18_METADATA,
  ...BATCH19_METADATA,
  ...BATCH20_METADATA,
  ...BATCH21_METADATA,
  ...BATCH22_METADATA,
  ...BATCH23_METADATA,
  ...BATCH24_METADATA,
  ...BATCH25_METADATA,
  ...BATCH26_METADATA,
  ...BATCH27_METADATA,
  ...BATCH28_METADATA,
  ...BATCH29_METADATA,
  ...BATCH30_METADATA,
  ...BATCH31_METADATA,
  ...BATCH32_METADATA,
  ...BATCH33_METADATA,
  ...BATCH34_METADATA,
  ...BATCH35_METADATA,
  ...BATCH36_METADATA,
  ...BATCH37_METADATA,
  ...BATCH38_METADATA,
  ...BATCH39_METADATA,
  ...BATCH40_METADATA,
  ...BATCH41_METADATA,
  ...BATCH42_METADATA,
  ...BATCH43_METADATA,
  ...BATCH44_METADATA,
  ...BATCH45_METADATA,
  ...BATCH46_METADATA,
  ...BATCH47_METADATA,
  ...BATCH48_METADATA,
  ...BATCH49_METADATA,
  ...BATCH50_METADATA,
  ...BATCH51_METADATA,
  ...BATCH52_METADATA,
  ...BATCH53_METADATA,
  ...BATCH54_METADATA,
  ...BATCH55_METADATA,
  ...BATCH56_METADATA,
  ...BATCH57_METADATA,
  ...BATCH58_METADATA,
  ...BATCH59_METADATA,
  ...BATCH60_METADATA,
  ...BATCH61_METADATA,
  ...BATCH62_METADATA,
  ...BATCH63_METADATA,
  ...PHASE18_METADATA,
  ...PHASE19_METADATA,
  ...PHASE20_METADATA,
  ...PHASE21_METADATA,
  ...PHASE22_METADATA,
  ...PHASE23_METADATA,
  ...PHASE25_METADATA,
  ...PHASE27_METADATA,
  ...BATCH64_FINANCE_BATCH1_METADATA,
  ...BATCH65_FINANCE_BATCH2_METADATA,
  ...BATCH66_PHASE56_BATCH1_METADATA,
  ...BATCH67_PHASE62_BATCH2_METADATA,
  ...BATCH68_PHASE66_BATCH3_METADATA,
  ...BATCH69_ANIMAL_GESTATION_METADATA,
  ...BATCH70_METADATA,
  ...BATCH81_BATCH_A_METADATA,
  ...BATCH82D_GROUP1_METADATA,
  ...BATCH82D_GROUP2_METADATA,
  ...BATCH82D_GROUP3_METADATA,
  ...BATCH82D_GROUP4_METADATA,
  ...BATCH82D_GROUP5_METADATA,
  ...BATCH82D_GROUP6_METADATA,
  ...BATCH82D_GROUP7_METADATA,
  ...BATCH82D_GROUP8_METADATA,
  ...BATCH83_GROUP1_METADATA,
  ...BATCH83_GROUP2_METADATA,
  ...BATCH83_GROUP3_METADATA,
  ...BATCH83_GROUP4_METADATA,
  ...BATCH83_GROUP5_METADATA,
  ...BATCH83_GROUP6_METADATA,
  ...BATCH83_GROUP7_METADATA,
  ...BATCH83_GROUP8_METADATA,
  ...BATCH84_GROUP1_METADATA,
  ...BATCH84_GROUP2_METADATA,
  ...BATCH84_GROUP3_METADATA,
  ...BATCH84_GROUP4_METADATA,
  ...BATCH84_GROUP5_METADATA,
  ...BATCH84_GROUP6_METADATA,
  ...BATCH84_GROUP7_METADATA,
  ...BATCH84_GROUP8_METADATA,
  ...BATCH84C_GROUP1_METADATA,
  ...BATCH84C_GROUP2_METADATA,
  ...BATCH84C_GROUP3_METADATA,
  ...BATCH84C_GROUP4_METADATA,
  ...BATCH84C_GROUP5_METADATA,
  ...BATCH84C_GROUP6_METADATA,
  ...BATCH84C_GROUP7_METADATA,
  ...BATCH84C_GROUP8_METADATA,
  ...BATCH84D_GROUP1_METADATA,
  ...BATCH84D_GROUP2_METADATA,
  ...BATCH84D_GROUP3_METADATA,
  ...BATCH84D_GROUP4_METADATA,
  ...BATCH84D_GROUP5_METADATA,
  ...BATCH84D_GROUP6_METADATA,
  ...BATCH84D_GROUP7_METADATA,
  ...BATCH84D_GROUP8_METADATA,
  ...BATCH85C_GROUP01_METADATA,
  ...BATCH85C_GROUP02_METADATA,
  ...BATCH85C_GROUP03_METADATA,
  ...BATCH85C_GROUP04_METADATA,
  ...BATCH85C_GROUP05_METADATA,
  ...BATCH85C_GROUP06_METADATA,
  ...BATCH85C_GROUP07_METADATA,
  ...BATCH85C_GROUP08_METADATA,
  ...BATCH85C_GROUP09_METADATA,
  ...BATCH85C_GROUP10_METADATA,
  ...BATCH85C_GROUP11_METADATA,
  ...BATCH85C_GROUP12_METADATA,
  ...BATCH85C_GROUP13_METADATA,
  ...BATCH85C_GROUP14_METADATA,
  ...BATCH85C_GROUP15_METADATA,
  ...BATCH85C_GROUP16_METADATA,
  ...BATCH85C_GROUP17_METADATA,
  ...BATCH85C_GROUP18_METADATA,
  ...BATCH85C_GROUP19_METADATA,
  ...BATCH85C_GROUP20_METADATA,
  ...BATCH85C_GROUP21_METADATA,
  ...BATCH85C_GROUP22_METADATA,
  ...BATCH85C_GROUP23_METADATA,
  ...BATCH85C_GROUP24_METADATA,
  ...BATCH85C_GROUP25_METADATA,
  ...BATCH85C_GROUP26_METADATA,
  ...BATCH85C_GROUP27_METADATA,
  ...BATCH85C_GROUP28_METADATA,
  ...BATCH85C_GROUP29_METADATA,
  ...BATCH85C_GROUP30_METADATA,
  ...BATCH85C_GROUP31_METADATA,
  ...BATCH85C_GROUP32_METADATA,
  ...BATCH85C_GROUP33_METADATA,
  ...BATCH85C_GROUP34_METADATA,
  ...BATCH85C_GROUP35_METADATA,
  ...BATCH85C_GROUP36_METADATA,
  ...BATCH85C_GROUP37_METADATA,
  ...BATCH85C_GROUP38_METADATA,
  ...BATCH85C_GROUP39_METADATA,
  ...BATCH85C_GROUP40_METADATA,
  ...BATCH85F_GROUP01_METADATA,
  ...BATCH85F_GROUP02_METADATA,
  ...BATCH85F_GROUP03_METADATA,
  ...BATCH85F_GROUP04_METADATA,
  ...BATCH85F_GROUP05_METADATA,
  ...BATCH85F_GROUP06_METADATA,
  ...BATCH85F_GROUP07_METADATA,
  ...BATCH85F_GROUP08_METADATA,
  ...BATCH85F_GROUP09_METADATA,
  ...BATCH85F_GROUP10_METADATA,
  ...BATCH85F_GROUP11_METADATA,
  ...BATCH85F_GROUP12_METADATA,
  ...BATCH85F_GROUP13_METADATA,
  ...BATCH85F_GROUP14_METADATA,
  ...BATCH85F_GROUP15_METADATA,
  ...BATCH85F_GROUP16_METADATA,
  ...BATCH85F_GROUP17_METADATA,
  ...BATCH85F_GROUP18_METADATA,
  ...BATCH85F_GROUP19_METADATA,
  ...BATCH85F_GROUP20_METADATA,
  ...BATCH85F_GROUP21_METADATA,
  ...BATCH85F_GROUP22_METADATA,
  ...BATCH85F_GROUP23_METADATA,
  ...BATCH85F_GROUP24_METADATA,
  ...BATCH85F_GROUP25_METADATA,
  ...BATCH85F_GROUP26_METADATA,
  ...BATCH85F_GROUP27_METADATA,
  ...BATCH85F_GROUP28_METADATA,
  ...BATCH85F_GROUP29_METADATA,
  ...BATCH85F_GROUP30_METADATA,
  ...BATCH85F_GROUP31_METADATA,
  ...BATCH85F_GROUP32_METADATA,
  ...BATCH85F_GROUP33_METADATA,
  ...BATCH85F_GROUP34_METADATA,
  ...BATCH85F_GROUP35_METADATA,
  ...BATCH85F_GROUP36_METADATA,
  ...BATCH85F_GROUP37_METADATA,
  ...BATCH85F_GROUP38_METADATA,
  ...BATCH85F_GROUP39_METADATA,
  ...BATCH85F_GROUP40_METADATA
];

const CATEGORY_MERGE_MAP: Record<string, string> = {
  'health': 'health-fitness',
  'image-design': 'additional-tools',
  'lifestyle': 'everyday'
};

export const CALCULATORS: CalculatorMeta[] = RAW_CALCULATORS.map(calc => {
  const targetCat = CATEGORY_MERGE_MAP[calc.category] || calc.category;
  if (targetCat !== calc.category) {
    return { ...calc, category: targetCat as CategoryId };
  }
  return calc;
});

// Dynamically computed actual unique tool counts for Categories
export const CATEGORIES: CategoryMeta[] = RAW_CATEGORIES.map((cat) => {
  const uniqueIds = new Set(CALCULATORS.filter((c) => c.category === cat.id).map(c => c.id));
  return {
    ...cat,
    count: uniqueIds.size
  };
});

// Dynamically computed actual unique tool counts for Subcategories
export const SUBCATEGORIES: SubcategoryMeta[] = RAW_SUBCATEGORIES.map((subcat) => {
  const uniqueIds = new Set(CALCULATORS.filter((c) => c.subcategoryId === subcat.id).map(c => c.id));
  return {
    ...subcat,
    count: uniqueIds.size
  };
});

// Top-level Toolbox categories (single source of truth for the 8 Toolbox pillars)
export const TOOLBOX_CATEGORIES = [
  { id: 'calculators', resolvedCategoryId: 'basic-math', i18nKey: 'hero.cat.calculators' },
  { id: 'converters', resolvedCategoryId: 'converter', i18nKey: 'hero.cat.converters' },
  { id: 'checkers', resolvedCategoryId: 'checkers', i18nKey: 'hero.cat.checkers' },
  { id: 'generators', resolvedCategoryId: 'generators', i18nKey: 'hero.cat.generators' },
  { id: 'planners', resolvedCategoryId: 'planners', i18nKey: 'hero.cat.planners' },
  { id: 'additional-tools', resolvedCategoryId: 'additional-tools', i18nKey: 'hero.cat.tools' },
  { id: 'trackers', resolvedCategoryId: 'trackers', i18nKey: 'hero.cat.trackers' },
  { id: 'guides', resolvedCategoryId: 'guides', i18nKey: 'hero.cat.guides' },
  { id: 'pdf-tools', resolvedCategoryId: 'pdf-tools', i18nKey: 'hero.cat.pdfTools' },
  { id: 'document-converters', resolvedCategoryId: 'document-converters', i18nKey: 'hero.cat.docConverters' }
] as const;

export function getRegisteredToolboxCategoriesCount(): number {
  const activeCategoryIds = new Set(CATEGORIES.filter((c) => c.isActive).map((c) => c.id));
  return TOOLBOX_CATEGORIES.filter((pillar) => activeCategoryIds.has(pillar.resolvedCategoryId as CategoryId)).length;
}

export const BASELINE_TOOLBOX_CATEGORIES_COUNT = 7;
export const BASELINE_TOOLS_COUNT = 462;

export interface CounterTrend {
  delta: number;
  percentage: number;
  direction: 'up' | 'down' | 'flat';
}

export function calculateCounterTrend(
  currentCount: number,
  baselineCount: number
): CounterTrend {
  if (baselineCount <= 0) {
    return {
      delta: currentCount,
      percentage: currentCount > 0 ? 100 : 0,
      direction: currentCount > 0 ? 'up' : 'flat'
    };
  }
  const delta = currentCount - baselineCount;
  const percentage = (delta / baselineCount) * 100;
  const direction: 'up' | 'down' | 'flat' =
    delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  return { delta, percentage, direction };
}

export function getUniqueRegisteredToolCount(): number {
  const validCategoryIds = new Set(CATEGORIES.filter((c) => c.isActive).map((c) => c.id));
  const uniqueIds = new Set<string>();
  for (const calc of CALCULATORS) {
    if (
      calc &&
      typeof calc.id === 'string' &&
      calc.id.trim() !== '' &&
      typeof calc.name === 'string' &&
      calc.name.trim() !== '' &&
      validCategoryIds.has(calc.category)
    ) {
      uniqueIds.add(calc.id);
    }
  }
  return uniqueIds.size;
}

// Helper lookup functions
export function getCategoryById(id: string): CategoryMeta | undefined {
  let resolvedId = id;
  if (id === 'calculators') resolvedId = 'basic-math';
  if (id === 'converters') resolvedId = 'converter';
  if (id === 'tools') resolvedId = 'tools';
  if (id === 'additional-tools') resolvedId = 'additional-tools';
  if (id === 'checkers') resolvedId = 'checkers';
  if (id === 'generators') resolvedId = 'generators';
  if (id === 'planners') resolvedId = 'planners';
  if (id === 'trackers') resolvedId = 'trackers';
  if (id === 'guides') resolvedId = 'guides';
  return CATEGORIES.find((c) => c.id === resolvedId || c.slug === resolvedId);
}

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
  let resolvedSlug = slug;
  if (slug === 'calculators') resolvedSlug = 'basic-math';
  if (slug === 'converters') resolvedSlug = 'converter';
  if (slug === 'tools') resolvedSlug = 'tools';
  if (slug === 'additional-tools') resolvedSlug = 'additional-tools';
  if (slug === 'checkers') resolvedSlug = 'checkers';
  if (slug === 'generators') resolvedSlug = 'generators';
  if (slug === 'planners') resolvedSlug = 'planners';
  if (slug === 'trackers') resolvedSlug = 'trackers';
  if (slug === 'guides') resolvedSlug = 'guides';
  return CATEGORIES.find((c) => c.slug === resolvedSlug || c.id === resolvedSlug);
}

export function getSubcategoryById(id: string): SubcategoryMeta | undefined {
  return SUBCATEGORIES.find((s) => s.id === id);
}

export function getSubcategoryBySlug(categorySlug: string, subcategorySlug: string): SubcategoryMeta | undefined {
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return undefined;
  return SUBCATEGORIES.find((s) => s.categoryId === cat.id && (s.slug === subcategorySlug || s.id === subcategorySlug));
}

export function getSubcategoriesForCategory(categoryId: string): SubcategoryMeta[] {
  const catMeta = getCategoryById(categoryId);
  const targetId = catMeta ? catMeta.id : categoryId;
  let resolvedId = targetId;
  if (targetId === 'calculators') resolvedId = 'basic-math';
  if (targetId === 'converters') resolvedId = 'converter';
  if (targetId === 'tools') resolvedId = 'tools';
  if (targetId === 'additional-tools') resolvedId = 'additional-tools';
  if (targetId === 'checkers') resolvedId = 'checkers';
  if (targetId === 'generators') resolvedId = 'generators';
  if (targetId === 'planners') resolvedId = 'planners';
  if (targetId === 'trackers') resolvedId = 'trackers';
  if (targetId === 'guides') resolvedId = 'guides';
  return SUBCATEGORIES.filter((s) => s.categoryId === resolvedId || s.categoryId === targetId || s.categoryId === categoryId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCalculatorsByCategory(categoryId: string): CalculatorMeta[] {
  const catMeta = getCategoryById(categoryId);
  const targetId = catMeta ? catMeta.id : categoryId;
  let resolvedId = targetId;
  if (targetId === 'calculators') resolvedId = 'basic-math';
  if (targetId === 'converters') resolvedId = 'converter';
  if (targetId === 'tools') resolvedId = 'tools';
  if (targetId === 'additional-tools') resolvedId = 'additional-tools';
  if (targetId === 'checkers') resolvedId = 'checkers';
  if (targetId === 'generators') resolvedId = 'generators';
  if (targetId === 'planners') resolvedId = 'planners';
  if (targetId === 'trackers') resolvedId = 'trackers';
  if (targetId === 'guides') resolvedId = 'guides';
  return CALCULATORS.filter((c) => c.category === resolvedId || c.category === targetId || c.category === categoryId);
}

export function getCalculatorsBySubcategory(subcategoryId: string): CalculatorMeta[] {
  return CALCULATORS.filter((c) => c.subcategoryId === subcategoryId);
}
