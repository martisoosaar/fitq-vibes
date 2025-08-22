'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Calculator, Heart, Weight, Dumbbell, Activity, Target, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

export default function CalculatorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'bmi';
  
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profile');
      if (response.data.data) {
        setUserProfile(response.data.data.profile);
        if (response.data.data.profile?.unit_system) {
          setUnitSystem(response.data.data.profile.unit_system);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const setActiveTab = (tab: string) => {
    router.push(`/calculators?tab=${tab}`);
  };

  const tabs = [
    { id: 'bmi', name: 'BMI', icon: Weight },
    { id: 'body-fat', name: 'Body Fat', icon: Activity },
    { id: 'bmr', name: 'BMR', icon: TrendingUp },
    { id: 'one-rep-max', name: '1RM', icon: Dumbbell },
    { id: 'target-heart-rate', name: 'Heart Rate', icon: Heart },
    { id: 'ideal-weight', name: 'Ideal Weight', icon: Target },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Fitness Calculators</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Unit System Selector */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Units:</label>
            <select
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value as 'metric' | 'imperial')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {activeTab === 'bmi' && <BMICalculator unitSystem={unitSystem} userProfile={userProfile} />}
          {activeTab === 'body-fat' && <BodyFatCalculator unitSystem={unitSystem} userProfile={userProfile} />}
          {activeTab === 'bmr' && <BMRCalculator unitSystem={unitSystem} userProfile={userProfile} />}
          {activeTab === 'one-rep-max' && <OneRepMaxCalculator unitSystem={unitSystem} />}
          {activeTab === 'target-heart-rate' && <TargetHeartRateCalculator userProfile={userProfile} />}
          {activeTab === 'ideal-weight' && <IdealWeightCalculator unitSystem={unitSystem} userProfile={userProfile} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// BMI Calculator Component
function BMICalculator({ unitSystem, userProfile }: { unitSystem: string; userProfile: any }) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBMI] = useState<number | null>(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (userProfile) {
      if (userProfile.height_cm && unitSystem === 'metric') {
        setHeight(userProfile.height_cm.toString());
      }
      if (userProfile.weight_kg && unitSystem === 'metric') {
        setWeight(userProfile.weight_kg.toString());
      }
    }
  }, [userProfile, unitSystem]);

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    if (!h || !w) return;
    
    let bmiValue: number;
    if (unitSystem === 'metric') {
      bmiValue = w / ((h / 100) ** 2);
    } else {
      bmiValue = (w / (h ** 2)) * 703;
    }
    
    setBMI(bmiValue);
    
    if (bmiValue < 18.5) setCategory('Underweight');
    else if (bmiValue < 25) setCategory('Normal weight');
    else if (bmiValue < 30) setCategory('Overweight');
    else setCategory('Obese');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">BMI Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400">Calculate your Body Mass Index to assess if you're at a healthy weight.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height ({unitSystem === 'metric' ? 'cm' : 'inches'})
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder={unitSystem === 'metric' ? '170' : '67'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder={unitSystem === 'metric' ? '70' : '154'}
          />
        </div>
      </div>
      
      <button
        onClick={calculateBMI}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Calculate BMI
      </button>
      
      {bmi !== null && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {bmi.toFixed(1)}
          </div>
          <div className={`text-lg font-medium ${
            category === 'Normal weight' ? 'text-green-600' : 
            category === 'Overweight' ? 'text-yellow-600' : 
            category === 'Obese' ? 'text-red-600' : 'text-blue-600'
          }`}>
            {category}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <div>Underweight: BMI &lt; 18.5</div>
            <div>Normal weight: BMI 18.5-24.9</div>
            <div>Overweight: BMI 25-29.9</div>
            <div>Obese: BMI ≥ 30</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Body Fat Calculator Component
function BodyFatCalculator({ unitSystem, userProfile }: { unitSystem: string; userProfile: any }) {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [risk, setRisk] = useState('');

  const calculateBodyFat = () => {
    const h = parseFloat(height);
    const n = parseFloat(neck);
    const w = parseFloat(waist);
    const hp = parseFloat(hips);
    
    if (!h || !n || !w || (gender === 'female' && !hp)) return;
    
    let heightCm = unitSystem === 'metric' ? h : h * 2.54;
    let neckCm = unitSystem === 'metric' ? n : n * 2.54;
    let waistCm = unitSystem === 'metric' ? w : w * 2.54;
    let hipsCm = unitSystem === 'metric' ? hp : hp * 2.54;
    
    let bf: number;
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    }
    
    if (bf < 0) bf = 0;
    setBodyFat(bf);
    
    // Determine risk level
    if (gender === 'male') {
      if (bf < 18 && bf > 4) setRisk('Healthy');
      else if (bf > 25 || bf < 2) setRisk('High Risk');
      else setRisk('Acceptable');
    } else {
      if (bf < 25 && bf > 12) setRisk('Healthy');
      else if (bf > 32 || bf < 10) setRisk('High Risk');
      else setRisk('Acceptable');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Body Fat Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400">Estimate your body fat percentage using the US Navy method.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="male"
              checked={gender === 'male'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2"
            />
            Male
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="female"
              checked={gender === 'female'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2"
            />
            Female
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height ({unitSystem === 'metric' ? 'cm' : 'inches'})
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Neck ({unitSystem === 'metric' ? 'cm' : 'inches'})
          </label>
          <input
            type="number"
            value={neck}
            onChange={(e) => setNeck(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Waist ({unitSystem === 'metric' ? 'cm' : 'inches'})
          </label>
          <input
            type="number"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
          />
        </div>
        
        {gender === 'female' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hips ({unitSystem === 'metric' ? 'cm' : 'inches'})
            </label>
            <input
              type="number"
              value={hips}
              onChange={(e) => setHips(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>
        )}
      </div>
      
      <button
        onClick={calculateBodyFat}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Calculate Body Fat
      </button>
      
      {bodyFat !== null && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {bodyFat.toFixed(1)}%
          </div>
          <div className={`text-lg font-medium ${
            risk === 'Healthy' ? 'text-green-600' : 
            risk === 'High Risk' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {risk}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {gender === 'male' ? (
              <>
                <div>Essential Fat: 2-5%</div>
                <div>Athletes: 6-13%</div>
                <div>Fitness: 14-17%</div>
                <div>Average: 18-24%</div>
                <div>Obese: &gt;25%</div>
              </>
            ) : (
              <>
                <div>Essential Fat: 10-13%</div>
                <div>Athletes: 14-20%</div>
                <div>Fitness: 21-24%</div>
                <div>Average: 25-31%</div>
                <div>Obese: &gt;32%</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// BMR Calculator Component
function BMRCalculator({ unitSystem, userProfile }: { unitSystem: string; userProfile: any }) {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmr, setBMR] = useState<number | null>(null);
  const [bmrMifflin, setBMRMifflin] = useState<number | null>(null);
  const [tdee, setTDEE] = useState<{ [key: string]: number } | null>(null);

  const calculateBMR = () => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    if (!a || !h || !w) return;
    
    let heightCm = unitSystem === 'metric' ? h : h * 2.54;
    let weightKg = unitSystem === 'metric' ? w : w * 0.45359237;
    
    // Harris-Benedict Equation (Revised 1984)
    let bmrHB: number;
    if (gender === 'male') {
      bmrHB = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * a);
    } else {
      bmrHB = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * a);
    }
    
    // Mifflin-St Jeor Equation (More accurate, recommended by dietitians)
    let bmrMSJ: number;
    if (gender === 'male') {
      bmrMSJ = (10 * weightKg) + (6.25 * heightCm) - (5 * a) + 5;
    } else {
      bmrMSJ = (10 * weightKg) + (6.25 * heightCm) - (5 * a) - 161;
    }
    
    setBMR(bmrHB);
    setBMRMifflin(bmrMSJ);
    
    // Use Mifflin-St Jeor for TDEE (more accurate)
    // Updated activity factors based on recent research
    setTDEE({
      sedentary: bmrMSJ * 1.2,
      light: bmrMSJ * 1.375,
      moderate: bmrMSJ * 1.55,
      active: bmrMSJ * 1.725,
      veryActive: bmrMSJ * 1.9
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">BMR Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400">Calculate your Basal Metabolic Rate and daily calorie needs.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="male"
              checked={gender === 'male'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2"
            />
            Male
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="female"
              checked={gender === 'female'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2"
            />
            Female
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder="25"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height ({unitSystem === 'metric' ? 'cm' : 'inches'})
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
          />
        </div>
      </div>
      
      <button
        onClick={calculateBMR}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Calculate BMR
      </button>
      
      {bmr !== null && tdee !== null && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Basal Metabolic Rate (Mifflin-St Jeor)</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(bmrMifflin!)} calories/day
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Harris-Benedict: {Math.round(bmr)} cal/day
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Daily Energy Expenditure (TDEE)</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sedentary (little or no exercise):</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(tdee.sedentary)} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Lightly active (1-3 days/week):</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(tdee.light)} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Moderately active (3-5 days/week):</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(tdee.moderate)} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Very active (6-7 days/week):</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(tdee.active)} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Extra active (physical job):</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(tdee.veryActive)} cal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// One Rep Max Calculator Component
function OneRepMaxCalculator({ unitSystem }: { unitSystem: string }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRepMax, setOneRepMax] = useState<number | null>(null);
  const [epleyMax, setEpleyMax] = useState<number | null>(null);
  const [percentages, setPercentages] = useState<{ [key: string]: number } | null>(null);

  const calculateOneRepMax = () => {
    const w = parseFloat(weight);
    const r = parseFloat(reps);
    
    if (!w || !r || r > 30) return;
    
    // Multiple formulas for better accuracy
    // Brzycki Formula (accurate for <10 reps)
    const brzycki = r <= 10 ? w / (1.0278 - (0.0278 * r)) : null;
    
    // Epley Formula (accurate for higher reps)
    const epley = w * (1 + r / 30);
    
    // Lombardi Formula
    const lombardi = w * Math.pow(r, 0.10);
    
    // O'Conner Formula
    const oconner = w * (1 + r / 40);
    
    // Average of valid formulas for best estimate
    const validFormulas = [brzycki, epley, lombardi, oconner].filter(v => v !== null) as number[];
    const avgMax = validFormulas.reduce((a, b) => a + b, 0) / validFormulas.length;
    
    setOneRepMax(avgMax);
    setEpleyMax(epley);
    
    // Calculate training percentages with rep ranges
    setPercentages({
      95: avgMax * 0.95,  // 1-2 reps
      90: avgMax * 0.90,  // 3-4 reps
      85: avgMax * 0.85,  // 5-6 reps
      80: avgMax * 0.80,  // 7-8 reps
      75: avgMax * 0.75,  // 9-10 reps
      70: avgMax * 0.70,  // 11-12 reps
      65: avgMax * 0.65,  // 13-15 reps
      60: avgMax * 0.60,  // 16-20 reps
      55: avgMax * 0.55,  // 20-24 reps
      50: avgMax * 0.50   // 25-30 reps
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">One Rep Max Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400">Estimate your one-rep maximum based on your current lifts.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weight Lifted ({unitSystem === 'metric' ? 'kg' : 'lbs'})
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder={unitSystem === 'metric' ? '80' : '176'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Repetitions (max 30)
          </label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            max="30"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder="5"
          />
        </div>
      </div>
      
      <button
        onClick={calculateOneRepMax}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Calculate 1RM
      </button>
      
      {oneRepMax !== null && percentages !== null && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Estimated One Rep Max</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {oneRepMax.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Training Percentages</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(percentages).map(([percent, value]) => (
                <div key={percent} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{percent}%:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {value.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Target Heart Rate Calculator Component
function TargetHeartRateCalculator({ userProfile }: { userProfile: any }) {
  const [age, setAge] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [zones, setZones] = useState<{ [key: string]: number } | null>(null);
  const [karvonenZones, setKarvonenZones] = useState<{ [key: string]: number } | null>(null);
  const [maxHeartRate, setMaxHeartRate] = useState<number | null>(null);

  const calculateTargetHeartRate = () => {
    const a = parseFloat(age);
    const rhr = parseFloat(restingHR) || 70; // Default resting HR if not provided
    
    if (!a || a < 10 || a > 100) return;
    
    // Updated formula: Tanaka formula (more accurate than 220-age)
    const maxHRTanaka = 208 - (0.7 * a);
    const maxHRClassic = 220 - a;
    
    // Use Tanaka as primary, show classic as reference
    setMaxHeartRate(Math.round(maxHRTanaka));
    
    // Standard percentage zones
    setZones({
      50: Math.round(maxHRTanaka * 0.5),
      60: Math.round(maxHRTanaka * 0.6),
      70: Math.round(maxHRTanaka * 0.7),
      80: Math.round(maxHRTanaka * 0.8),
      85: Math.round(maxHRTanaka * 0.85),
      90: Math.round(maxHRTanaka * 0.9),
      95: Math.round(maxHRTanaka * 0.95)
    });
    
    // Karvonen method (accounts for resting heart rate)
    if (restingHR) {
      const hrReserve = maxHRTanaka - rhr;
      setKarvonenZones({
        50: Math.round(rhr + (hrReserve * 0.5)),
        60: Math.round(rhr + (hrReserve * 0.6)),
        70: Math.round(rhr + (hrReserve * 0.7)),
        80: Math.round(rhr + (hrReserve * 0.8)),
        85: Math.round(rhr + (hrReserve * 0.85)),
        90: Math.round(rhr + (hrReserve * 0.9))
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Target Heart Rate Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400">Calculate your target heart rate zones for optimal training.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age (10-100)
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="10"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder="25"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resting Heart Rate (optional)
          </label>
          <input
            type="number"
            value={restingHR}
            onChange={(e) => setRestingHR(e.target.value)}
            min="40"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder="60-70 bpm"
          />
        </div>
      </div>
      
      <button
        onClick={calculateTargetHeartRate}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Calculate Heart Rate Zones
      </button>
      
      {maxHeartRate !== null && zones !== null && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Maximum Heart Rate (Tanaka Formula)</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {maxHeartRate} bpm
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Classic formula (220-age): {220 - parseFloat(age)} bpm
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Training Zones</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zone 1 - Recovery (50-60%):</span>
                <span className="font-medium text-gray-900 dark:text-white">{zones[50]}-{zones[60]} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zone 2 - Base (60-70%):</span>
                <span className="font-medium text-gray-900 dark:text-white">{zones[60]}-{zones[70]} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zone 3 - Aerobic (70-80%):</span>
                <span className="font-medium text-gray-900 dark:text-white">{zones[70]}-{zones[80]} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zone 4 - Threshold (80-90%):</span>
                <span className="font-medium text-gray-900 dark:text-white">{zones[80]}-{zones[90]} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zone 5 - Max (90-100%):</span>
                <span className="font-medium text-gray-900 dark:text-white">{zones[90]}-{maxHeartRate} bpm</span>
              </div>
            </div>
          </div>
          
          {karvonenZones && (
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Karvonen Method (with resting HR)</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">50%:</span>
                  <span className="text-gray-700 dark:text-gray-300">{karvonenZones[50]} bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">60%:</span>
                  <span className="text-gray-700 dark:text-gray-300">{karvonenZones[60]} bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">70%:</span>
                  <span className="text-gray-700 dark:text-gray-300">{karvonenZones[70]} bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">80%:</span>
                  <span className="text-gray-700 dark:text-gray-300">{karvonenZones[80]} bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">90%:</span>
                  <span className="text-gray-700 dark:text-gray-300">{karvonenZones[90]} bpm</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Ideal Weight Calculator Component
function IdealWeightCalculator({ unitSystem, userProfile }: { unitSystem: string; userProfile: any }) {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [frameSize, setFrameSize] = useState('medium');
  const [idealWeights, setIdealWeights] = useState<{ [key: string]: number } | null>(null);

  const calculateIdealWeight = () => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    
    if (!a || !h) return;
    
    let heightCm = unitSystem === 'metric' ? h : h * 2.54;
    let heightInches = unitSystem === 'imperial' ? h : h / 2.54;
    
    // Multiple formulas for comprehensive results
    const weights: { [key: string]: number } = {};
    
    // 1. Hamwi Formula (1964) - Popular and reliable
    let hamwiBase = gender === 'male' 
      ? 48 + 2.7 * (heightInches - 60)
      : 45.5 + 2.2 * (heightInches - 60);
    
    // Frame size adjustment for Hamwi
    if (frameSize === 'small') hamwiBase *= 0.9;
    if (frameSize === 'large') hamwiBase *= 1.1;
    weights.hamwi = hamwiBase;
    
    // 2. Devine Formula (1974) - Used in medical settings
    weights.devine = gender === 'male'
      ? 50 + 2.3 * (heightInches - 60)
      : 45.5 + 2.3 * (heightInches - 60);
    
    // 3. Robinson Formula (1983) - Modification of Devine
    weights.robinson = gender === 'male'
      ? 52 + 1.9 * (heightInches - 60)
      : 49 + 1.7 * (heightInches - 60);
    
    // 4. Miller Formula (1983) - Another modification
    weights.miller = gender === 'male'
      ? 56.2 + 1.41 * (heightInches - 60)
      : 53.1 + 1.36 * (heightInches - 60);
    
    // 5. BMI-based ideal weight (BMI 22 - center of healthy range)
    weights.bmi22 = 22 * (heightCm / 100) * (heightCm / 100);
    
    // Convert all to appropriate units
    Object.keys(weights).forEach(key => {
      if (unitSystem === 'imperial' && key !== 'bmi22') {
        weights[key] = weights[key]; // Already in pounds
      } else if (unitSystem === 'metric' && key !== 'bmi22') {
        weights[key] = weights[key] * 0.45359237; // Convert to kg
      } else if (unitSystem === 'imperial' && key === 'bmi22') {
        weights[key] = weights[key] * 2.20462262; // Convert to pounds
      }
    });
    
    setIdealWeights(weights);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ideal Weight Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400">Calculate your ideal body weight based on height, age, and gender.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="male"
              checked={gender === 'male'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2"
            />
            Male
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="female"
              checked={gender === 'female'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2"
            />
            Female
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder="25"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height ({unitSystem === 'metric' ? 'cm' : 'inches'})
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder={unitSystem === 'metric' ? '170' : '67'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frame Size
          </label>
          <select
            value={frameSize}
            onChange={(e) => setFrameSize(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={calculateIdealWeight}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Calculate Ideal Weight
      </button>
      
      {idealWeights !== null && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ideal Weight Range</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.min(...Object.values(idealWeights)).toFixed(0)}-{Math.max(...Object.values(idealWeights)).toFixed(0)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Different Formulas</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Hamwi (with frame):</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {idealWeights.hamwi.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Devine (medical):</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {idealWeights.devine.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Robinson:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {idealWeights.robinson.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Miller:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {idealWeights.miller.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">BMI 22 (healthy):</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {idealWeights.bmi22.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Note: These are estimates. Ideal weight varies based on muscle mass, bone density, and body composition. Athletes may weigh more due to muscle mass.
          </div>
        </div>
      )}
    </div>
  );
}