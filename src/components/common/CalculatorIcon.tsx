import React from 'react';
import {
  Activity, AlertCircle, AlertTriangle, AlignJustify, ArrowRightLeft, ArrowUpRight,
  Atom, Award, BarChart, BarChart2, BarChart3, BatteryCharging, Binary, BookOpen, Box, Boxes,
  Briefcase, Building, Calculator, Calendar, CalendarCheck, CalendarDays, Car, CheckCircle, Circle, Clock,
  Code, Coins, Columns, Compass, Copy, CornerDownRight, Cpu, CreditCard, Cylinder, Diamond,
  Disc, Divide, DollarSign, Droplet, FileCheck, FileText, Film, Flame, Gauge, Gift,
  GitCommit, GitFork, Globe, GraduationCap, Grid, Hammer, Hash, Heart, HeartPulse, HelpCircle,
  Hexagon, Home, Landmark, Layers, Leaf, ListOrdered, MapPin, Maximize, Maximize2, Minimize2,
  Moon, Navigation, Paintbrush, PawPrint, Percent, PieChart, PiggyBank, Plane, Radio, Receipt, RefreshCw,
  Repeat, RotateCcw, RotateCw, Ruler, Scale, Scissors, Search, Settings, Shapes, Share2, Shield,
  ShieldAlert, ShieldCheck, ShoppingBag, ShoppingCart, Sidebar, Sliders, Smile, Sparkles, Sprout, Square, Store,
  Sun, Table, Tag, Target, TrendingDown, TrendingUp, Triangle, Trophy, Tv, User, Users,
  Utensils, Wallet, Watch, Wifi, Wind, Wine, Wrench, Zap
} from 'lucide-react';

interface CalculatorIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

const iconMap: Record<string, React.ElementType> = {
  Activity, AlertCircle, AlertTriangle, AlignJustify, ArrowRightLeft, ArrowUpRight,
  Atom, Award, BarChart, BarChart2, BarChart3, BatteryCharging, Binary, BookOpen, Box, Boxes,
  Briefcase, Building, Calculator, Calendar, CalendarCheck, CalendarDays, Car, CheckCircle, Circle, Clock,
  Code, Coins, Columns, Compass, Copy, CornerDownRight, Cpu, CreditCard, Cylinder, Diamond,
  Disc, Divide, DollarSign, Droplet, FileCheck, FileText, Film, Flame, Gauge, Gift,
  GitCommit, GitFork, Globe, GraduationCap, Grid, Hammer, Hash, Heart, HeartPulse, HelpCircle,
  Hexagon, Home, Landmark, Layers, Leaf, ListOrdered, MapPin, Maximize, Maximize2, Minimize2,
  Moon, Navigation, Paintbrush, PawPrint, Percent, PieChart, PiggyBank, Plane, Radio, Receipt, RefreshCw,
  Repeat, RotateCcw, RotateCw, Ruler, Scale, Scissors, Search, Settings, Shapes, Share2, Shield,
  ShieldAlert, ShieldCheck, ShoppingBag, ShoppingCart, Sidebar, Sliders, Smile, Sparkles, Sprout, Square, Store,
  Sun, Table, Tag, Target, TrendingDown, TrendingUp, Triangle, Trophy, Tv, User, Users,
  Utensils, Wallet, Watch, Wifi, Wind, Wine, Wrench, Zap
};

export default function CalculatorIcon({ name, className = 'w-5 h-5 stroke-[2.2]', style }: CalculatorIconProps) {
  const IconComponent = iconMap[name] || Calculator;
  return <IconComponent className={className} style={style} />;
}
