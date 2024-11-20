import React, { useState } from 'react';
import { Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TerrainAnalyzer from '@/components/TerrainAnalyzer';
import { WindRatingForm } from '@/components/WindRatingForm';
import ExportPage from '@/components/ExportPage';
import { determineWindRegion } from '@/lib/wind-region';
import { getWindClassification } from '@/lib/wind-classification-matrix';
import { WIND_CLASSIFICATIONS } from '@/lib/constants';
import type { WindRegion, TerrainCategory, TopographicClass, ShieldingClass, WindResult } from '@/lib/types';

interface LocationData {
  latitude: number;
  longitude: number;
  elevation: number;
  terrainCategory?: TerrainCategory;
  maxSlope?: number;
  exposureCategory?: string;
  distanceFromCoast?: number;
  region?: WindRegion;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'calculator' | 'export'>('calculator');
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: -33.865143,
    longitude: 151.209900,
    elevation: 0
  });

  const [terrainCategory, setTerrainCategory] = useState<TerrainCategory>();
  const [originalTerrainCategory, setOriginalTerrainCategory] = useState<TerrainCategory>();
  const [topographicClass, setTopographicClass] = useState<TopographicClass>();
  const [shielding, setShielding] = useState<ShieldingClass>();
  const [result, setResult] = useState<WindResult | null>(null);
  const [address, setAddress] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [criticalDirection, setCriticalDirection] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<any>({});
  const [selectedRegion, setSelectedRegion] = useState<WindRegion>();

  const handleLocationUpdate = (lat: number, lng: number, elevation: number, analysis?: any) => {
    setLocationData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      elevation: elevation,
      terrainCategory: analysis?.terrainCategory,
      maxSlope: analysis?.maxSlope,
      exposureCategory: analysis?.exposureCategory,
      distanceFromCoast: analysis?.distanceFromCoast,
      region: analysis?.region
    }));

    if (analysis) {
      setOriginalTerrainCategory(analysis.terrainCategory);
      setTerrainCategory(analysis.terrainCategory);
      setTopographicClass(analysis.topographicClass);
      setAnalysisResults(analysis.analysisResults || []);
      if (analysis.criticalDirection) {
        setCriticalDirection({
          direction: analysis.criticalDirection,
          path: analysis.criticalPath
        });
      }
      if (analysis.region) {
        setSelectedRegion(analysis.region);
      }
    }
  };

  const handleFormChange = (formData: any) => {
    setShielding(formData.shielding as ShieldingClass);
    setCurrentFormData(formData);
  };

  const handleCalculate = async (formData: any) => {
    setIsCalculating(true);
    try {
      const region = selectedRegion || locationData.region || determineWindRegion(locationData.latitude, locationData.longitude);
      
      if (!formData.terrainCategory || !formData.topography || !formData.shielding) {
        console.error('Missing required parameters');
        return;
      }

      const classification = getWindClassification(
        region,
        formData.terrainCategory as TerrainCategory,
        formData.topography as TopographicClass,
        formData.shielding as ShieldingClass
      );

      // Handle NA classification
      if (classification === 'NA') {
        setResult({
          classification: 'NA',
          serviceSpeed: 0,
          ultimateSpeed: 0,
          description: 'This combination is not allowed per AS 4055-2021',
          region
        });
        return;
      }

      const speeds = region === 'C' || region === 'D' 
        ? WIND_CLASSIFICATIONS.CYCLONIC[classification as keyof typeof WIND_CLASSIFICATIONS.CYCLONIC]
        : WIND_CLASSIFICATIONS.NON_CYCLONIC[classification as keyof typeof WIND_CLASSIFICATIONS.NON_CYCLONIC];

      setResult({
        classification,
        serviceSpeed: speeds.serviceSpeed,
        ultimateSpeed: speeds.ultimateSpeed,
        description: `Wind classification ${classification} with design wind speed of ${speeds.ultimateSpeed} m/s`,
        region
      });
    } catch (error) {
      console.error('Error calculating wind parameters:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  if (currentPage === 'export' && result) {
    return (
      <ExportPage
        address={address}
        locationData={locationData}
        windResult={result}
        analysisResults={analysisResults}
        criticalDirection={criticalDirection}
        formData={currentFormData}
        onBack={() => setCurrentPage('calculator')}
      />
    );
  }

  return (
    <main className="min-h-screen p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Wind className="h-8 w-8" />
            <h1 className="text-3xl font-bold">
              Wind Rating Calculator (AS 4055-2021)
            </h1>
          </div>
          {result && (
            <Button onClick={() => setCurrentPage('export')}>
              Export Report
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="terrain" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="terrain">Terrain Analysis</TabsTrigger>
            <TabsTrigger value="rating">Wind Rating</TabsTrigger>
          </TabsList>

          <TabsContent value="terrain">
            <Card>
              <CardContent className="pt-6">
                <TerrainAnalyzer 
                  onLocationUpdate={handleLocationUpdate}
                  initialLocation={locationData}
                  analysisResults={analysisResults}
                  criticalDirection={criticalDirection}
                  onRegionChange={setSelectedRegion}
                  selectedRegion={selectedRegion}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rating">
            <Card>
              <CardContent className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-medium text-lg">Location Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Location:</span>
                      <div className="font-mono">{locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Elevation:</span>
                      <div className="font-mono">{locationData.elevation.toFixed(1)}m</div>
                    </div>
                    {locationData.maxSlope && (
                      <div>
                        <span className="text-slate-500">Max Slope:</span>
                        <div className="font-mono">{(locationData.maxSlope * 100).toFixed(1)}%</div>
                      </div>
                    )}
                    {locationData.terrainCategory && (
                      <div>
                        <span className="text-slate-500">Suggested Category:</span>
                        <div className="font-medium">{locationData.terrainCategory}</div>
                      </div>
                    )}
                  </div>
                </div>

                <WindRatingForm
                  initialTerrainCategory={terrainCategory}
                  initialTopography={topographicClass}
                  initialShielding={shielding}
                  onCalculate={handleCalculate}
                  isCalculating={isCalculating}
                  onFormChange={handleFormChange}
                  originalTerrainCategory={originalTerrainCategory}
                />

                {result && (
                  <div className="mt-6 p-4 bg-slate-100 rounded-md">
                    <h2 className="text-xl font-semibold mb-2">Results</h2>
                    <div className="space-y-2">
                      <p className="font-mono">{result.description}</p>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-3 bg-white rounded-md">
                          <div className="text-sm text-slate-500">Region</div>
                          <div className="text-2xl font-bold">{result.region}</div>
                        </div>
                        <div className="p-3 bg-white rounded-md">
                          <div className="text-sm text-slate-500">Classification</div>
                          <div className="text-2xl font-bold">{result.classification}</div>
                        </div>
                        <div className="p-3 bg-white rounded-md">
                          <div className="text-sm text-slate-500">Service Speed</div>
                          <div className="text-2xl font-bold">{result.serviceSpeed} m/s</div>
                        </div>
                        <div className="p-3 bg-white rounded-md">
                          <div className="text-sm text-slate-500">Ultimate Speed</div>
                          <div className="text-2xl font-bold">{result.ultimateSpeed} m/s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default App;