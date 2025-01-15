import { ArrowRight, Play } from 'lucide-react';
import { Navbar } from './nav/navbar';

export function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
            <header className="relative overflow-hidden">
                <Navbar />

                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12 pt-24 pb-20">
                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                                Virtual Spaces for{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                    Real Connections
                                </span>
                            </h1>
                            
                            <p className="mt-8 text-xl text-gray-600 leading-relaxed">
                                Create your own virtual world where teams can meet, collaborate, 
                                and socialize just like they would in real life.
                            </p>
                            
                            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                                <button className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transform hover:-translate-y-0.5 transition-all duration-200">
                                    <span>Try Demo</span>
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                                
                                <button className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-gray-200 text-gray-700 font-medium hover:border-indigo-600 hover:text-indigo-600 transition-colors duration-200">
                                    <Play className="w-5 h-5 mr-2" />
                                    <span>Watch Video</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="flex-1 relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none" />
                                <img
                                    src="https://assets-global.website-files.com/60ca686c96b42034829a80d3/632e2be5332c838918d97ac6_Gather-coworking.png"
                                    alt="Virtual office space"
                                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            
                            {/* Decorative elements */}
                            <div className="absolute -z-10 top-1/2 right-1/2 w-[200%] aspect-square bg-indigo-50/50 rounded-full blur-3xl" />
                            <div className="absolute -z-10 bottom-0 right-0 w-72 h-72 bg-violet-50/50 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}