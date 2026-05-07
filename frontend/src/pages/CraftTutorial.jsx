import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Lightbulb, Save, Sparkles, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

const fallbackIdea = {
    craftName: 'Hand-Painted Clay Trinket Dish',
    skillLevel: 'Beginner',
    materialsRequired: ['Air-dry clay', 'Acrylic colors', 'Small brush', 'Clear sealant'],
    steps: [
        'Shape the clay into a shallow dish and smooth the edges with damp fingers.',
        'Let it dry completely, then sand any uneven spots gently.',
        'Paint a simple motif inspired by your chosen theme.',
        'Seal the surface once the paint dries so it lasts longer.'
    ],
    estimatedTime: '2-3 hours plus drying time',
    creativeTip: 'Keep one tiny imperfection visible; it makes the piece feel honestly handmade.',
    sellingIdea: 'Photograph it with jewelry or keys to show buyers how it fits into daily life.'
};

const CraftTutorial = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [idea, setIdea] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleGenerate = async (event) => {
        event.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setSaved(false);
        try {
            const { data } = await axios.post(apiUrl('/api/ai/craft-tutorial'), {
                prompt,
                skillLevel
            });
            setIdea(data);
        } catch (error) {
            console.error('Craft tutorial generation failed:', error);
            setIdea({ ...fallbackIdea, skillLevel });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!idea) return;
        if (!user) {
            navigate('/login');
            return;
        }

        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(apiUrl('/api/ai/saved-ideas'), idea, config);
            setSaved(true);
        } catch (error) {
            console.error('Saving craft idea failed:', error);
            alert('Could not save this idea right now.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Craft Studio
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#3E2723] tracking-tight">
                            Craft Tutorial Generator
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
                    <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-[#8D6E63] mb-2">
                                Craft Idea
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full min-h-36 rounded-2xl border border-[#D7CCC8] bg-[#FDFBF7] px-4 py-3 text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                placeholder="Terracotta lamp with folk patterns"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-[#8D6E63] mb-2">
                                Skill Level
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                    <button
                                        type="button"
                                        key={level}
                                        onClick={() => setSkillLevel(level)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                                            skillLevel === level
                                                ? 'bg-[#3E2723] text-white border-[#3E2723]'
                                                : 'bg-white text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            {loading ? 'Generating...' : 'Generate Tutorial'}
                        </button>
                    </form>

                    <div className="min-h-[520px]">
                        {!idea ? (
                            <div className="h-full bg-white rounded-3xl border border-dashed border-[#D7CCC8] p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-[#EFEBE9] flex items-center justify-center mb-5">
                                    <BookOpen className="w-9 h-9 text-[#8D6E63]" />
                                </div>
                                <h2 className="text-2xl font-black text-[#3E2723] mb-2">Your next handmade idea starts here</h2>
                                <p className="text-sm text-[#8D6E63] max-w-md">
                                    Enter a craft direction and KalaKart will shape it into materials, steps, timing, and selling notes.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-7">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                        <div>
                                            <span className="inline-flex items-center gap-2 text-xs font-black text-[#8D6E63] uppercase tracking-widest mb-3">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                {idea.skillLevel}
                                            </span>
                                            <h2 className="text-3xl font-black text-[#3E2723] leading-tight">
                                                {idea.craftName}
                                            </h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={saving || saved}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#EFEBE9] text-[#3E2723] font-bold hover:bg-[#D7CCC8] transition disabled:opacity-70"
                                        >
                                            <Save className="w-4 h-4" />
                                            {saved ? 'Saved' : saving ? 'Saving...' : 'Save Idea'}
                                        </button>
                                    </div>

                                    <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1.5 rounded-xl text-sm font-bold">
                                        <Clock className="w-4 h-4" />
                                        {idea.estimatedTime}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <section className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6">
                                        <h3 className="text-lg font-black text-[#3E2723] mb-4 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-[#8D6E63]" />
                                            Materials
                                        </h3>
                                        <ul className="space-y-3">
                                            {(idea.materialsRequired || []).map((material) => (
                                                <li key={material} className="text-sm text-gray-700 bg-[#FDFBF7] border border-[#EFEBE9] rounded-xl px-3 py-2">
                                                    {material}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    <section className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6">
                                        <h3 className="text-lg font-black text-[#3E2723] mb-4 flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-[#8D6E63]" />
                                            Studio Notes
                                        </h3>
                                        <div className="space-y-3 text-sm text-gray-700">
                                            <p className="bg-[#FDFBF7] border border-[#EFEBE9] rounded-xl px-3 py-2">{idea.creativeTip}</p>
                                            <p className="bg-[#FDFBF7] border border-[#EFEBE9] rounded-xl px-3 py-2">{idea.sellingIdea}</p>
                                        </div>
                                    </section>
                                </div>

                                <section className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6">
                                    <h3 className="text-lg font-black text-[#3E2723] mb-5 flex items-center gap-2">
                                        <Wand2 className="w-5 h-5 text-[#8D6E63]" />
                                        Steps
                                    </h3>
                                    <div className="space-y-4">
                                        {(idea.steps || []).map((step, index) => (
                                            <div key={`${index}-${step}`} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-[#3E2723] text-white text-xs font-black flex items-center justify-center shrink-0">
                                                    {index + 1}
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed pt-1.5">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CraftTutorial;
