import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity, ArrowRight, ShieldCheck, Microscope,
    Users, Building2, PhoneCall, ChevronRight,
    ClipboardList, Globe, BarChart3, Search,
    FileText, Zap, Lock, HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import PulseReportLogo from '../../assets/DP.png';

const PulseReportEBStyle = () => {
    const navigate = useNavigate();
    const handleLogin = () => {
        navigate('/login');
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <nav className="border-b border-slate-100 px-10 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <img src={PulseReportLogo} alt="PulseReport Logo" className="h-20 w-auto object-contain" />
                        <span className="text-2xl font-black text-blue-900 tracking-tighter">PulseReport</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogin} className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition uppercase text-xs tracking-widest">
                        Login
                    </button>
                </div>
            </nav>

            <section className="bg-slate-50 py-16 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-10 grid lg:grid-cols-12 gap-12 items-center">
                    <motion.div className="lg:col-span-7 space-y-6" {...fadeInUp}>
                        <h1 className="text-5xl font-black text-slate-900 leading-[1.1]">
                            India's Premier Digital <br />
                            <span className="text-blue-600">Medical Data Marketplace</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-xl">
                            Connecting laboratories, hospitals, and patients on a secure, real-time reporting network.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[240px]">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Search size={20} /></div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Search by</p>
                                    <p className="font-bold text-sm">Lab ID / Patient UID</p>
                                </div>
                            </div>
                            <button className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-xl">
                                Track Report <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                    <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                        <StatBox label="Active Labs" value="1,200+" />
                        <StatBox label="Reports Issued" value="4.8M" />
                        <StatBox label="Pincodes" value="18,000+" />
                        <StatBox label="Avg Delivery" value="4.2 Hrs" />
                    </div>
                </div>
            </section>

            <section className="py-24 max-w-7xl mx-auto px-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div {...fadeInUp}>
                        <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">Our Mission</h4>
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Redefining Health Data Accessibility</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            Founded in 2020, PulseReport was built to bridge the gap between diagnostic accuracy and patient accessibility. We believe that medical data should be <strong>portable, secure, and instant.</strong>
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-1 rounded-full text-green-600"><ShieldCheck size={20} /></div>
                                <p className="text-slate-700 font-medium">NABL & HIPAA Compliant Data Standards</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-1 rounded-full text-blue-600"><Globe size={20} /></div>
                                <p className="text-slate-700 font-medium">Network of 5000+ Verified Clinical Partners</p>
                            </div>
                        </div>
                    </motion.div>
                    <div className="bg-slate-100 rounded-3xl p-8 aspect-video flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
                        <Users size={120} className="text-slate-300" />
                        <div className="absolute bottom-6 left-6 right-6 bg-white p-6 rounded-2xl shadow-xl">
                            <p className="text-slate-900 font-bold italic">"PulseReport has reduced our report turnaround time by 65%."</p>
                            <p className="text-blue-600 text-sm font-bold mt-2">— Dr. Arvind Mehta, City Diagnostics</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 uppercase">Comprehensive Report Infrastructure</h2>
                        <p className="text-slate-500 mt-2">What makes a PulseReport smarter than a standard PDF?</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ReportFeature
                            icon={<Zap />}
                            title="Instant Sync"
                            desc="Results are pushed to the patient's phone the millisecond they are authorized by the lab."
                        />
                        <ReportFeature
                            icon={<BarChart3 />}
                            title="Trend Analysis"
                            desc="Automatically compare current results with historical data to track health improvements."
                        />
                        <ReportFeature
                            icon={<Lock />}
                            title="QR Verification"
                            desc="Every report contains a unique encrypted QR code to prevent tampering or fraud."
                        />
                    </div>
                </div>
            </section>

            <section className="py-20 max-w-7xl mx-auto px-10">
                <div className="flex items-center justify-between mb-10 border-b-2 border-blue-600 pb-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Our Service Verticals</h2>
                    <a href="#" className="text-blue-600 font-bold flex items-center gap-1 text-sm group">
                        View All Services <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CategoryCard icon={<Microscope />} title="Diagnostic Labs" desc="Integration for independent pathology units." />
                    <CategoryCard icon={<Building2 />} title="Hospitals" desc="Unified reporting systems for multi-specialty units." />
                    <CategoryCard icon={<Globe />} title="Telehealth" desc="Digital API access for online health portals." />
                    <CategoryCard icon={<ClipboardList />} title="Health Insurers" desc="Verified data access for claim processing." />
                </div>
            </section>

            <section className="bg-slate-900 py-20 text-white">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <Feature icon={<ShieldCheck className="text-blue-400" />} title="Zero-Trust Security" text="Your data is encrypted using military-grade AES-256 protocols." />
                        <Feature icon={<BarChart3 className="text-blue-400" />} title="Real-time Analytics" text="Live dashboard for institutional stakeholders and admins." />
                        <Feature icon={<PhoneCall className="text-blue-400" />} title="Dedicated Support" text="24/7 technical assistance for mission-critical operations." />
                    </div>
                </div>
            </section>

            <footer className="bg-slate-50 border-t border-slate-200 py-16 px-10">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <img src={PulseReportLogo} alt="Logo" className="h-8 w-auto" />
                            <span className="text-xl font-bold text-blue-900 uppercase">PulseReport</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            PulseReport is a registered trademark of PR MedTech Ltd. Digitalizing healthcare data across the continent.
                        </p>
                    </div>
                    <FooterLinks title="Solutions" links={['Pathology', 'Radiology', 'Pharmacy Integration', 'Patient Portal']} />
                    <FooterLinks title="Company" links={['About Us', 'Leadership', 'Careers', 'Media Kit']} />
                    <FooterLinks title="Legal" links={['Privacy Policy', 'Data Security', 'T&C', 'HIPAA Compliance']} />
                </div>
            </footer>
        </div>
    );
};


const StatBox = ({ label, value }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center"
    >
        <p className="text-3xl font-black text-blue-600">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </motion.div>
);

const ReportFeature = ({ icon, title, desc }) => (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
        <div className="text-blue-600 mb-4">{React.cloneElement(icon, { size: 32 })}</div>
        <h4 className="font-bold text-xl mb-2 text-slate-900">{title}</h4>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

const CategoryCard = ({ icon, title, desc }) => (
    <div className="p-8 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:border-blue-600/20 transition-all cursor-pointer group">
        <div className="mb-6 text-slate-300 group-hover:text-blue-600 transition-colors">
            {React.cloneElement(icon, { size: 40 })}
        </div>
        <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

const Feature = ({ icon, title, text }) => (
    <div className="flex gap-6">
        <div className="shrink-0">{React.cloneElement(icon, { size: 32 })}</div>
        <div>
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
        </div>
    </div>
);

const FooterLinks = ({ title, links }) => (
    <div>
        <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-6">{title}</h5>
        <ul className="space-y-4 text-sm text-slate-500 font-medium">
            {links.map((l, i) => <li key={i} className="hover:text-blue-600 cursor-pointer">{l}</li>)}
        </ul>
    </div>
);

export default PulseReportEBStyle;