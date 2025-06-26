
import React, { useState, useEffect } from 'react';
import { fal } from "@fal-ai/client";

interface ExampleResult {
  id: string;
  title: string;
  beforeSrc: string;
  afterSrc: string;
  address: string;
}

const StaticExampleGenerator: React.FC = () => {
    const [examples, setExamples] = useState<ExampleResult[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentProgress, setCurrentProgress] = useState('');

    // Coordinates of residential areas with confirmed Street View house visibility
    const sampleLocations = [
        { coord: "34.0522,-118.2437", name: "Los Angeles Residential" }, // LA suburbs
        { coord: "40.7128,-74.0060", name: "NYC Residential" }, // NYC residential area
        { coord: "41.8781,-87.6298", name: "Chicago Suburban" }, // Chicago suburbs
        { coord: "29.7604,-95.3698", name: "Houston Residential" }, // Houston residential
        { coord: "33.4484,-112.0740", name: "Phoenix Suburban" }, // Phoenix suburbs
    ];</old_str></old_str></old_str>

    const generateExample = async (location: {coord: string, name: string}, index: number): Promise<ExampleResult | null> => {
        try {
            setCurrentProgress(`Generating example ${index + 1}/5: ${location.name}`);
            
            const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
            if (!GOOGLE_MAPS_API_KEY) {
                throw new Error("Google Maps API Key is not configured.");
            }

            // Try multiple headings to find houses - headings: 0, 90, 180, 270
            const headings = [0, 90, 180, 270];
            let streetViewResponse;
            let successfulHeading = 0;
            
            // Try each heading until we get a successful response
            for (const heading of headings) {
                const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${location.coord}&fov=70&heading=${heading}&pitch=-10&key=${GOOGLE_MAPS_API_KEY}`;
                streetViewResponse = await fetch(streetViewUrl);
                if (streetViewResponse.ok) {
                    successfulHeading = heading;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between attempts
            }
            
            if (!streetViewResponse || !streetViewResponse.ok) {
                console.warn(`Could not fetch Street View for: ${location.name}`);
                return null;
            }</old_str>

            const imageBlob = await streetViewResponse.blob();
            const reader = new FileReader();
            const base64data = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });

            const beforeImage = `data:${imageBlob.type};base64,${base64data}`;

            // Configure Fal.ai client
            fal.config({
                credentials: process.env.FAL_API_KEY
            });

            const landscapePrompt = "Improve ONLY the landscaping and grass areas while keeping the house, driveway, sidewalks, and street completely unchanged. Add lush green grass, colorful flower beds near the house foundation, neatly trimmed bushes, and small decorative plants. Keep all hardscaping (driveways, walkways, roads) exactly the same. Make the yard look well-maintained and professionally landscaped but realistic and subtle. Do not change any building structures, colors, or architectural features.";

            // Generate AI landscape with very conservative settings
            const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
                input: {
                    image_url: beforeImage,
                    prompt: landscapePrompt,
                    strength: 0.15, // Very low strength to preserve original structure
                    guidance_scale: 2.0, // Lower guidance for more natural results
                    num_inference_steps: 12, // Fewer steps for less dramatic changes
                    seed: Math.floor(Math.random() * 1000000)
                },
                logs: true,
            });

            const afterImage = result.data.images[0].url;

            return {
                id: `example-${index}`,
                title: `${location.name} Transformation`,
                beforeSrc: beforeImage,
                afterSrc: afterImage,
                address: location.name
            };</old_str>

        } catch (error) {
            console.error(`Error generating example for ${address}:`, error);
            return null;
        }
    };

    const generateAllExamples = async () => {
        setIsGenerating(true);
        setExamples([]);
        
        const results: ExampleResult[] = [];
        
        for (let i = 0; i < sampleLocations.length; i++) {
            const example = await generateExample(sampleLocations[i], i);
            if (example) {
                results.push(example);
                setExamples([...results]); // Update state with each successful generation
            }
            
            // Add small delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }</old_str>
        
        setIsGenerating(false);
        setCurrentProgress('');
        
        // Log the results for copying to static data
        console.log('Generated Examples (copy this data):', JSON.stringify(results, null, 2));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#22573b] mb-4">Static Example Generator</h2>
            <p className="text-gray-600 mb-4">
                This tool generates real examples using actual addresses. Use this to create static examples for the homepage.
            </p>
            
            <button
                onClick={generateAllExamples}
                disabled={isGenerating}
                className="bg-[#22573b] text-white px-6 py-3 rounded-lg hover:bg-[#1a4429] disabled:bg-gray-400 mb-4"
            >
                {isGenerating ? 'Generating Examples...' : 'Generate Real Examples'}
            </button>
            
            {isGenerating && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 font-medium">{currentProgress}</p>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(examples.length / sampleLocations.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {examples.map(example => (
                    <div key={example.id} className="border rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50">
                            <h3 className="font-semibold text-[#22573b]">{example.title}</h3>
                            <p className="text-sm text-gray-600">{example.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-0">
                            <div className="relative">
                                <img src={example.beforeSrc} alt="Before" className="w-full h-32 object-cover" />
                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                                    BEFORE
                                </div>
                            </div>
                            <div className="relative">
                                <img src={example.afterSrc} alt="After" className="w-full h-32 object-cover" />
                                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
                                    AFTER
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {examples.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
                    <p className="text-green-700 text-sm">
                        Generated {examples.length} examples. Check the browser console for JSON data to copy into your static examples.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StaticExampleGenerator;
