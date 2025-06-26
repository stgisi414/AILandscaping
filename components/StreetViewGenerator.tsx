
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
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);

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

            // Step 1: First get geocoding to find the exact coordinates and determine best heading
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();
            
            if (geocodeData.status !== 'OK' || !geocodeData.results.length) {
                throw new Error('Could not find the specified address. Please check the address and try again.');
            }

            const location = geocodeData.results[0].geometry.location;
            const lat = location.lat;
            const lng = location.lng;

            // Try multiple headings to find the best view of the house
            const headings = [0, 90, 180, 270]; // North, East, South, West
            let bestHeading = 0;
            let streetViewUrl = '';

            // Use the first heading that works, prioritizing front-facing views
            for (const heading of headings) {
                const testUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&fov=90&heading=${heading}&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
                const testResponse = await fetch(testUrl);
                if (testResponse.ok) {
                    streetViewUrl = testUrl;
                    bestHeading = heading;
                    break;
                }
            }

            if (!streetViewUrl) {
                throw new Error('Could not find a Street View image for this address. The location may not have Street View coverage.');
            }

            const streetViewResponse = await fetch(streetViewUrl);
            const imageBlob = await streetViewResponse.blob();

            const reader = new FileReader();
            const base64data = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });

            setBeforeImage(`data:${imageBlob.type};base64,${base64data}`);

            // Step 2: Enhanced Gemini analysis for comprehensive property improvements
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const enhancedAnalysisPrompt = `Analyze this street view image comprehensively and provide detailed improvement recommendations. Focus on ALL aspects of curb appeal and property maintenance:

LANDSCAPING ANALYSIS:
1. Lawn condition (patchy areas, bare spots, weeds, overall health)
2. Existing trees and shrubs (health, pruning needs, placement)
3. Flower beds and garden areas (design, plant selection, mulching)
4. Edging and borders between lawn and other areas

MAINTENANCE & CLEANING NEEDS:
5. Driveway condition (stains, cracks, need for pressure washing)
6. Walkways and sidewalks (cleaning, repairs needed)
7. Mailbox condition (painting, replacement, positioning)
8. House exterior (siding cleaning, trim touch-ups)
9. Windows (cleaning, frame condition)
10. Gutters and downspouts (cleaning, repairs)

HARDSCAPING & FEATURES:
11. Fence condition (painting, repairs, replacement)
12. Light fixtures (cleaning, updating, positioning)
13. Porch/entryway improvements
14. Parking areas and their condition

DESIGN ENHANCEMENTS:
15. Color coordination and visual flow
16. Seasonal interest and year-round appeal
17. Privacy and screening needs
18. Functional improvements (lighting, accessibility)

For each area identified, provide specific, actionable recommendations with realistic timeline and priority level (High/Medium/Low). Be very detailed about what needs cleaning, painting, replacing, or enhancing.`;

            const imageForGemini = {
                inlineData: {
                    data: base64data,
                    mimeType: imageBlob.type
                }
            };

            const analysisResult = await model.generateContent([enhancedAnalysisPrompt, imageForGemini]);
            const analysisText = analysisResult.response.text();
            setAnalysis(analysisText);

            // Step 3: Create comprehensive improvement prompt for AI generation
            const comprehensivePrompt = `Transform this property with comprehensive improvements based on this detailed analysis: ${analysisText}

APPLY ALL THESE IMPROVEMENTS:
- Pressure wash all driveways, walkways, and sidewalks to remove stains and dirt
- Clean and repaint mailbox and any exterior fixtures
- Restore lawn to lush, green, well-maintained condition
- Clean house siding, windows, and trim
- Add vibrant, well-designed landscaping with flowers and plants
- Improve edging and create defined garden borders
- Clean and maintain all visible hardscaping elements
- Enhance curb appeal with coordinated colors and design

CRITICAL: Keep the house structure, architecture, roofline, windows, doors, and basic hardscaping layout EXACTLY the same. Only improve the condition, cleanliness, and landscaping. Make everything look freshly cleaned, painted, and professionally maintained.`;

            // Step 4: Configure Fal.ai client and generate improved image
            fal.config({
                credentials: process.env.FAL_API_KEY
            });

            const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
                input: {
                    image_url: `data:${imageBlob.type};base64,${base64data}`,
                    prompt: comprehensivePrompt,
                    strength: 0.4,
                    guidance_scale: 5.0,
                    num_inference_steps: 30,
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

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleZoomReset = () => {
        setZoomLevel(1);
    };

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-[#22573b]">Restyle From The Street</h2>
                <p className="mt-4 text-lg max-w-2xl mx-auto text-[#212529]/80">
                    No photo? No problem. Enter your home address and our AI will use Google Street View to create a stunning new landscape design with comprehensive property improvements.
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

                {/* Controls */}
                {(afterImage || analysis) && (
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Button
                            onClick={() => setShowAnalysis(!showAnalysis)}
                            variant={showAnalysis ? "primary" : "secondary"}
                            className="px-4 py-2"
                        >
                            {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                        </Button>
                        {afterImage && (
                            <div className="flex gap-2">
                                <Button onClick={handleZoomOut} disabled={zoomLevel <= 0.5} className="px-3 py-2">
                                    Zoom Out
                                </Button>
                                <Button onClick={handleZoomReset} className="px-3 py-2">
                                    Reset Zoom
                                </Button>
                                <Button onClick={handleZoomIn} disabled={zoomLevel >= 3} className="px-3 py-2">
                                    Zoom In
                                </Button>
                                <span className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-12">
                    {isLoading && (
                         <div className="flex flex-col items-center justify-center p-8 bg-[#f8f9fa] rounded-lg">
                             <svg className="animate-spin h-12 w-12 text-[#22573b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             <p className="mt-4 text-lg font-medium text-[#22573b]">Analyzing property and crafting comprehensive improvements...</p>
                         </div>
                    )}
                    {error && <p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p>}
                    
                    {analysis && showAnalysis && (
                        <div className="mt-8 p-6 bg-blue-50 rounded-lg text-left">
                            <h3 className="text-lg font-bold text-blue-800 mb-3">🏡 Comprehensive Property Analysis</h3>
                            <div className="text-blue-700 whitespace-pre-wrap text-sm leading-relaxed">{analysis}</div>
                        </div>
                    )}
                    
                    {afterImage && beforeImage && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-8">
                            <div>
                                <h3 className="text-xl font-bold text-[#6b4f4f] mb-4">Before (from Street View)</h3>
                                <div className="overflow-hidden rounded-lg shadow-xl">
                                    <img 
                                        src={beforeImage} 
                                        alt="Before landscaping from Google Street View" 
                                        className="w-full aspect-video object-cover transition-transform duration-200"
                                        style={{ transform: `scale(${zoomLevel})` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#22573b] mb-4">After (AI Enhanced)</h3>
                                <div className="overflow-hidden rounded-lg shadow-xl">
                                    <img 
                                        src={afterImage} 
                                        alt="After AI landscaping and property improvements" 
                                        className="w-full aspect-video object-cover transition-transform duration-200"
                                        style={{ transform: `scale(${zoomLevel})` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default StreetViewGenerator;
