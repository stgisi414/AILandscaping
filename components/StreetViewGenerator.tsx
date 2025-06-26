import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Button from './ui/Button';
import { fal } from "@fal-ai/client";

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const StreetViewGenerator: React.FC = () => {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [afterImage, setAfterImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) {
            setError('Please enter an address.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setBeforeImage(null);
        setAfterImage(null);
        setAnalysis(null);

        try {
            // Check for required API keys
            const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
            const API_KEY = process.env.API_KEY;
            
            if (!GOOGLE_MAPS_API_KEY) {
                throw new Error("Google Maps API Key is not configured.");
            }
            if (!API_KEY) {
                throw new Error("Gemini API Key is not configured.");
            }

            // Step 1: Fetch Street View image with correct heading (no rotation - front view)
            const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(address)}&fov=90&heading=0&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
            const streetViewResponse = await fetch(streetViewUrl);
            if (!streetViewResponse.ok) {
                throw new Error('Could not find a Street View image for this address. Please try a different address.');
            }
            const imageBlob = await streetViewResponse.blob();

            const reader = new FileReader();
            const base64data = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });

            setBeforeImage(`data:${imageBlob.type};base64,${base64data}`);

            // Step 2: Use Gemini to analyze the landscaping and suggest improvements
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const analysisPrompt = `Analyze this street view image of a house and its current landscaping. Provide specific, realistic recommendations for improving the landscaping while keeping the house structure exactly the same. Focus on:

1. Current state of the lawn/grass
2. Existing trees and their condition
3. Flower beds and garden areas
4. Driveway and walkway landscaping
5. Overall curb appeal

Provide 3-5 specific improvement suggestions that would be realistic and achievable. Be very specific about plant types, lawn improvements, and design elements. Keep the house, building colors, architecture, and hardscaping (driveways, sidewalks) exactly as they are.`;

            const imageForGemini = {
                inlineData: {
                    data: base64data,
                    mimeType: imageBlob.type
                }
            };

            const analysisResult = await model.generateContent([analysisPrompt, imageForGemini]);
            const analysisText = analysisResult.response.text();
            setAnalysis(analysisText);

            // Step 3: Create targeted prompt based on Gemini analysis
            const targetedPrompt = `Based on this landscaping analysis, enhance ONLY the yard and landscaping areas: ${analysisText}. 

CRITICAL: Keep the house structure, building colors, roof, windows, doors, siding, and driveway/hardscaping EXACTLY the same. Only improve the landscaping elements mentioned in the analysis. Maintain the same house architecture and colors perfectly.`;

            // Step 4: Configure Fal.ai client and generate improved image
            fal.config({
                credentials: process.env.FAL_API_KEY
            });

            const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
                input: {
                    image_url: `data:${imageBlob.type};base64,${base64data}`,
                    prompt: targetedPrompt,
                    strength: 0.3,
                    guidance_scale: 4.0,
                    num_inference_steps: 25,
                    seed: Math.floor(Math.random() * 1000000)
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log) => log.message).forEach(console.log);
                    }
                },
            });

            const imageUrl = result.data.images[0].url;
            setAfterImage(imageUrl);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-[#22573b]">Restyle From The Street</h2>
                <p className="mt-4 text-lg max-w-2xl mx-auto text-[#212529]/80">
                    No photo? No problem. Enter your home address and our AI will use Google Street View to create a stunning new landscape design.
                </p>

                <form onSubmit={handleGenerate} className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your home address"
                        className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#a3ccab]"
                        aria-label="Home address"
                    />
                    <Button type="submit" variant="primary" className="py-3 px-8 text-base" disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center">
                                <LoadingSpinner />
                                Generating...
                            </div>
                        ) : 'Generate with Street View'}
                    </Button>
                </form>

                <div className="mt-12">
                    {isLoading && (
                         <div className="flex flex-col items-center justify-center p-8 bg-[#f8f9fa] rounded-lg">
                             <svg className="animate-spin h-12 w-12 text-[#22573b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             <p className="mt-4 text-lg font-medium text-[#22573b]">Crafting your landscape... this may take a moment.</p>
                         </div>
                    )}
                    {error && <p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p>}
                    {analysis && (
                        <div className="mt-8 p-6 bg-blue-50 rounded-lg text-left">
                            <h3 className="text-lg font-bold text-blue-800 mb-3">AI Landscaping Analysis</h3>
                            <div className="text-blue-700 whitespace-pre-wrap">{analysis}</div>
                        </div>
                    )}
                    {afterImage && beforeImage && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-8">
                            <div>
                                <h3 className="text-xl font-bold text-[#6b4f4f] mb-4">Before (from Street View)</h3>
                                <img src={beforeImage} alt="Before landscaping from Google Street View" className="rounded-lg shadow-xl w-full aspect-video object-cover" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#22573b] mb-4">After (AI Design)</h3>
                                <img src={afterImage} alt="After AI landscaping design" className="rounded-lg shadow-xl w-full aspect-video object-cover" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default StreetViewGenerator;