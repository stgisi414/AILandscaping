import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
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

        try {
            // This is a placeholder for a real API key which should be in a secure environment
            const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
            if (!GOOGLE_MAPS_API_KEY) {
                throw new Error("Google Maps API Key is not configured.");
            }

            // Step 1: Fetch Street View image with better positioning
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

            const imageForApi = {
                mimeType: imageBlob.type,
                data: base64data,
            };
            setBeforeImage(`data:${imageBlob.type};base64,${base64data}`);

            // Step 2: Configure Fal.ai client
            fal.config({
                credentials: process.env.API_KEY
            });

            const landscapePrompt = "Transform only the yard and landscaping of this house while keeping the exact same house structure, architecture, colors, and positioning. Add beautiful professional landscaping including: lush green lawn, colorful flower beds with seasonal blooms, mature shade trees, decorative shrubs, stone or brick walkways, outdoor lighting fixtures, well-maintained garden borders, and enhanced curb appeal. Keep the house, driveway, roof, windows, and any existing structures exactly as they are. Only enhance and beautify the yard, grass, plants, and outdoor landscaping elements to create a stunning, magazine-worthy exterior.";

            // Use Fal.ai FLUX.1 Image-to-Image for landscaping transformation
            const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
                input: {
                    image_url: `data:${imageBlob.type};base64,${base64data}`,
                    prompt: landscapePrompt,
                    strength: 0.75,
                    guidance_scale: 7.5,
                    num_inference_steps: 28,
                    seed: Math.floor(Math.random() * 1000000),
                    enable_safety_checker: true
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
                    {afterImage && beforeImage && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
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