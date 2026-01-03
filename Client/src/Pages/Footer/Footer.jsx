import logo from '../../assets/JKFooter.png';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="w-full text-center">
            <div className="w-full h-0.5 bg-red-600"></div>

            <h6 className="text-1xl font-semibold text-black-800 mt-2">
                OUR COMPANIES
            </h6>

            <div className="p-4">
                <img
                    src={logo}
                    alt="Company Logo"
                    className="mx-auto w-full max-w-screen-xl h-auto"
                />
            </div>

            <div className="bg-red-600 py-4 text-white text-left">
                <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex space-x-4 mb-4 md:mb-0">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <Linkedin size={24} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <Twitter size={24} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <Facebook size={24} />
                        </a>

                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram size={24} />
                        </a>

                    </div>

                    <div className="text-sm text-center font-bold">
                        Copyright ©{currentYear} | JK India eAgritech Limited | All rights reserved.
                    </div>

                    <div className="text-sm text-white mt-4 md:mt-0 flex flex-wrap justify-center md:justify-end space-x-2">
                        <a href="/terms" className="hover:underline font-bold">Terms of Use</a>
                        <span>|</span>
                        <a href="/insurance" className="hover:underline font-bold">Insurance Policy</a>
                        <span>|</span>
                        <a href="/faq" className="hover:underline font-bold">FAQ</a>
                        <span>|</span>
                        <a href="/contact" className="hover:underline font-bold">Contact Us</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
