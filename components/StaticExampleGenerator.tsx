
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

    // Real residential addresses for generating examples
    const sampleAddresses = [
        "123 Maple Street, Anytown, OH 44256", // Typical suburban home
        "456 Oak Avenue, Springfield, IL 62701", // Classic residential street
        "789 Pine Drive, Madison, WI 53703", // Normal neighborhood
        "321 Elm Street, Franklin, TN 37064", // Suburban development
        "654 Cedar Lane, Plano, TX 75023", // Modern subdivision
    ];

    const generateExample = async (address: string, index: number): Promise<ExampleResult | null> => {
        try {
            setCurrentProgress(`Generating example ${index + 1}/5: ${address}`);
            
            const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
            if (!GOOGLE_MAPS_API_KEY) {
                throw new Error("Google Maps API Key is not configured.");
            }

            // Fetch Street View image
            const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(address)}&fov=90&heading=180&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
            const streetViewResponse = await fetch(streetViewUrl);
            if (!streetViewResponse.ok) {
                console.warn(`Could not fetch Street View for: ${address}`);
                return null;
            }

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

            const landscapePrompt = "Transform ONLY the landscaping and yard areas into a stunning, professionally designed outdoor space. Keep the house, building structure, architecture, colors, roof, windows, doors, and driveway EXACTLY the same. Create a vibrant, inviting landscape with: lush emerald green lawn with perfect edging, colorful flower beds with blooming roses and seasonal flowers, mature shade trees strategically placed, well-defined garden borders with decorative stone or brick edging, layered plantings with varying heights and textures, ornamental shrubs and bushes, and a cohesive design that enhances curb appeal. Style should be elegant and professionally maintained. Do NOT change the house structure, colors, or architectural style. Preserve all existing buildings perfectly.";

            // Generate AI landscape
            const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
                input: {
                    image_url: beforeImage,
                    prompt: landscapePrompt,
                    strength: 0.4,
                    guidance_scale: 3.5,
                    num_inference_steps: 20,
                    seed: Math.floor(Math.random() * 1000000)
                },
                logs: true,
            });

            const afterImage = result.data.images[0].url;

            return {
                id: `example-${index}`,
                title: `${address.split(',')[0]} Transformation`,
                beforeSrc: beforeImage,
                afterSrc: afterImage,
                address: address
            };

        } catch (error) {
            console.error(`Error generating example for ${address}:`, error);
            return null;
        }
    };

    const generateAllExamples = async () => {
        setIsGenerating(true);
        setExamples([]);
        
        const results: ExampleResult[] = [];
        
        for (let i = 0; i < sampleAddresses.length; i++) {
            const example = await generateExample(sampleAddresses[i], i);
            if (example) {
                results.push(example);
                setExamples([...results]); // Update state with each successful generation
            }
            
            // Add small delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
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
                            style={{ width: `${(examples.length / sampleAddresses.length) * 100}%` }}
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
