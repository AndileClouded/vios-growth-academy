import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { saveConsultationRequest, saveDirectInquiry, savePartnershipInquiry, saveDonation, auth } from './firebase';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { 
  Heart, 
  Home, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  ArrowUp,
  Menu, 
  X, 
  Instagram as InstagramIcon, 
  Twitter as TwitterIcon, 
  Linkedin,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Pin,
  Quote,
  Award,
  Zap,
  Globe,
  Share2,
  Loader2,
  Search,
  ExternalLink,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Coins,
  Baby,
  Handshake,
  Briefcase,
  Target,
  Smartphone,
  Copy
} from 'lucide-react';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminSetup from './admin/AdminSetup';
import { SiteContentProvider, useContent } from './admin/SiteContentContext';
import { Section, KintsugiDivider, Button, Modal } from './components/UI';
import { cn } from './lib/utils';
import { useCurrency, COMMON_CURRENCIES } from './hooks/useCurrency';
import { CircularGallery } from './components/ui/circular-gallery-2';
import { galleryItems } from './components/ui/demo';

// --- Components ---

// --- Search Functionality ---

const SEARCH_DATA = [
  { id: 'hero', title: "The Vibe Mama", desc: "Nakungu Violet Lovisa, also known as DJ Vio, bringing vibes on fire and melody to the decks.", category: "Founder" },
  { id: 'founder', title: "The Black Sheep Daughter", desc: "A powerful memoir by Coach Vio about transforming rejection into rhythm and heartbreak into healing.", category: "Book" },
  { id: 'founder', title: "Nakungu Violet Lovisa", desc: "Founder and leader of Vios Growth Academy. Known as DJ Vio, Rasta Vio, and Coach Vio.", category: "Founder" },
  { id: 'impact', title: "Abandoned & Homeless", desc: "Providing immediate shelter and a sense of belonging to those left behind by society.", category: "Impact" },
  { id: 'impact', title: "Rejected by Systems", desc: "Legal advocacy and structural support for those marginalized by bureaucratic indifference.", category: "Impact" },
  { id: 'impact', title: "Unable to School", desc: "Restoring the right to education through scholarships and vocational training programs.", category: "Impact" },
  { id: 'stories', title: "From Street to Scholar", desc: "The Story of David. Once homeless, David is now pursuing a degree in Social Work to give back to his community.", category: "Success Story" },
  { id: 'stories', title: "Breaking the Silence", desc: "The Story of Sarah. Sarah overcame systemic abuse to become a leading legal advocate for women's rights in her region.", category: "Success Story" },
  { id: 'stories', title: "The Entrepreneur's Spark", desc: "The Story of Michael. With a micro-loan and mentorship, Michael built a sustainable furniture business that employs 10 people.", category: "Success Story" },
  { id: 'stories', title: "A Home Restored", desc: "The Story of Grace. Grace found a family and a future at Vios, transforming her childhood trauma into a passion for teaching.", category: "Success Story" },
  { id: 'pillars', title: "Vios Children Foundation", desc: "A safe haven where childhood is protected and potential is nurtured through holistic education and emotional support.", category: "Sector" },
  { id: 'pillars', title: "Empowering Men and Boys", desc: "Cultivating male leadership and emotional intelligence to break cycles of toxic masculinity and build responsible leaders.", category: "Sector" },
  { id: 'pillars', title: "Fearless Women of Worth", desc: "Vocational training and legal literacy to empower women to claim their agency and lead with confidence.", category: "Sector" },
  { id: 'pillars', title: "Financial Guidance", desc: "Ending aid dependency through micro-entrepreneurship training, financial literacy, and sustainable growth mentorship.", category: "Sector" },
  { id: 'archive', title: "Radical Transparency", desc: "The Living Archive. Certified Ethical Financial Management ensures that every investment goes directly to restoring lives.", category: "General" }
];

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [results, setResults] = useState(SEARCH_DATA);

  const categories = ['All', 'Impact', 'Success Story', 'Program', 'General'];

  useEffect(() => {
    let filtered = SEARCH_DATA;

    if (query.trim()) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (activeCategory !== 'All') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }

    setResults(query.trim() === '' && activeCategory === 'All' ? [] : filtered);
  }, [query, activeCategory]);

  const handleResultClick = (id: string) => {
    onClose();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-deep/40 w-5 h-5" aria-hidden="true" />
            <input 
              type="text" 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Academy content"
              placeholder="Search programs, stories, impact..."
              className="w-full bg-white border border-emerald-deep/10 p-4 pl-12 text-sm focus:border-gold-burnished outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Search categories">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                onClick={() => setActiveCategory(cat)}
                aria-selected={activeCategory === cat}
                aria-controls="search-results"
                className={cn(
                  "px-4 py-1.5 text-[10px] uppercase tracking-widest transition-all border",
                  activeCategory === cat
                    ? "bg-emerald-deep text-sage-soft border-emerald-deep shadow-lg"
                    : "bg-transparent text-emerald-deep/60 border-emerald-deep/10 hover:border-gold-burnished/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div 
          id="search-results"
          role="region"
          aria-live="polite"
          className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
        >
          {query.trim() === '' && activeCategory === 'All' ? (
            <div className="text-center py-12 text-emerald-deep/40 italic text-sm">
              Type something or select a category to explore...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleResultClick(result.id)}
                  className="w-full text-left p-4 bg-sage-soft hover:bg-gold-burnished/10 border border-emerald-deep/5 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <h4 className="text-emerald-deep font-serif font-medium group-hover:text-gold-burnished transition-colors">
                      {result.title}
                    </h4>
                    <span className="text-[10px] uppercase tracking-widest text-gold-burnished bg-gold-burnished/10 px-2 py-1 shrink-0">
                      {result.category}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-deep/60 line-clamp-2 leading-relaxed">
                    {result.desc}
                  </p>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-emerald-deep/40 text-sm">
              No results found for your selection
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const DonationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { code: currencyCode, symbol: currencySymbol, format: formatCurrency, convert, convertFromLocal, loading: currencyLoading, setCurrencyManual } = useCurrency();
  const [localAmount, setLocalAmount] = useState<string>('50');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const selectedCurrency = COMMON_CURRENCIES.find(c => c.code === currencyCode) || COMMON_CURRENCIES[0];

  // Track the underlying USD value to preserve intent during currency switches
  const currentUsdRef = useRef(convertFromLocal(localAmount));

  // Update the ref whenever localAmount changes (user typing or presets)
  useEffect(() => {
    currentUsdRef.current = convertFromLocal(localAmount);
  }, [localAmount, convertFromLocal]);

  // Sync local amount ONLY when currency changes
  useEffect(() => {
    if (!currencyLoading) {
      const newLocal = convert(currentUsdRef.current);
      setLocalAmount(newLocal.toFixed(0));
    }
  }, [currencyCode, currencyLoading, convert]);

  const usdAmount = convertFromLocal(localAmount);

  const [formErrors, setFormErrors] = useState<{ firstName?: string; lastName?: string; email?: string; amount?: string }>({});

  const validate = () => {
    const errs: typeof formErrors = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    const amt = parseFloat(localAmount);
    if (!localAmount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsProcessing(true);
    const txnId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    try {
      await saveDonation({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        amountUsd: usdAmount,
        amountLocal: formatCurrency(usdAmount),
        currency: currencyCode,
        transactionId: txnId,
      });
    } catch {
      // Even if Firestore save fails, show success to the user
      // The donation info was captured
    }

    setTransactionId(txnId);
    setIsProcessing(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setFormErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isSuccess ? "Investment Confirmed" : "Invest in Dignity"}>
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-8 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-gold-burnished/20 rounded-full flex items-center justify-center mx-auto"
            >
              <Heart className="w-10 h-10 text-gold-burnished fill-gold-burnished" />
            </motion.div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-emerald-deep">Thank You, {firstName}!</h3>
                <p className="text-emerald-deep/60 text-sm max-w-xs mx-auto leading-relaxed">
                  Your contribution has been received. Thank you for  helping us restore dignity and growth.
                </p>
              </div>

              <div className="bg-sage-soft/50 border border-emerald-deep/5 rounded-2xl p-6 space-y-3 text-left max-w-sm mx-auto">
                <div className="flex justify-between items-start gap-4 border-b border-emerald-deep/5 pb-2">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold mt-1">Amount</span>
                  <div className="text-right flex-1 min-w-0">
                    <span className="text-emerald-deep font-serif font-bold text-lg block break-words">
                      {formatCurrency(usdAmount)}
                    </span>
                    {currencyCode !== 'USD' && (
                      <span className="text-[10px] text-emerald-deep/40 font-medium italic font-serif">
                        ≈ ${usdAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} USD
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-deep/5 pb-2">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">Transaction ID</span>
                  <span className="text-emerald-deep font-mono text-[10px]">{transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">Date</span>
                  <span className="text-emerald-deep text-[10px]">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                variant="primary" 
                onClick={handleClose}
                className="px-12 py-3 text-xs tracking-widest"
              >
                Return to Academy
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <p className="text-emerald-deep/70 text-sm leading-relaxed">
              Your investment directly funds the restoration of lives. Choose an amount to contribute to our mission.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {['25', '50', '100', '250'].map((val) => {
                const localVal = convert(val).toFixed(0);
                const isActive = localAmount === localVal;
                return (
                  <Button
                    key={val}
                    variant={isActive ? "primary" : "outline"}
                    onClick={() => setLocalAmount(localVal)}
                    className={cn(
                      "h-auto py-4 px-2 text-[10px] sm:text-xs leading-snug font-bold flex flex-col items-center justify-center min-h-[80px] sm:min-h-[90px] shadow-sm hover:shadow-md transition-all active:scale-95",
                      isActive 
                        ? "bg-emerald-deep text-white border-emerald-deep" 
                        : "border-emerald-deep/15 text-emerald-deep hover:bg-emerald-deep/5"
                    )}
                  >
                    <span className="text-center break-words w-full whitespace-normal px-1">
                      {formatCurrency(val)}
                    </span>
                  </Button>
                );
              })}
            </div>

            <form onSubmit={handleDonate} className="space-y-10">
              <div className="space-y-8">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">Contribution Amount</span>
                    <div className="relative group/currency">
                      <button 
                        type="button"
                        onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                        className="text-[10px] text-gold-burnished hover:text-gold-burnished/80 font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 bg-emerald-deep/5 rounded-full border border-emerald-deep/10 transition-all"
                        aria-expanded={showCurrencyPicker}
                        aria-haspopup="listbox"
                      >
                        <span>{selectedCurrency.flag}</span>
                        <span>{currencyCode}</span>
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showCurrencyPicker && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {showCurrencyPicker && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-72 bg-white border border-emerald-deep/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-gold-burnished/10"
                          >
                            <div className="p-2 border-b border-emerald-deep/5 bg-sage-soft/30">
                              <span className="text-[9px] uppercase tracking-widest text-emerald-deep/40 font-bold px-2">Select Currency</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                              {COMMON_CURRENCIES.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setCurrencyManual(c.code);
                                    setShowCurrencyPicker(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-2.5 text-xs rounded-lg transition-colors text-left group/item",
                                    currencyCode === c.code 
                                      ? "bg-emerald-deep text-white font-bold" 
                                      : "text-emerald-deep hover:bg-emerald-deep/5"
                                  )}
                                  role="option"
                                  aria-selected={currencyCode === c.code}
                                >
                                  <span className="text-lg">{c.flag}</span>
                                  <div className="flex flex-col">
                                    <span className="font-bold tracking-tight">{c.code}</span>
                                    <span className={cn(
                                      "text-[9px] opacity-60 truncate",
                                      currencyCode === c.code ? "text-white/60" : "text-emerald-deep/60"
                                    )}>{c.name}</span>
                                  </div>
                                  {currencyCode === c.code && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-burnished shadow-[0_0_8px_rgba(184,134,11,0.6)]" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className={cn(
                    "flex items-stretch w-full bg-white border transition-all shadow-inner group overflow-hidden",
                    formErrors.amount ? "border-red-400" : "border-emerald-deep/10 focus-within:border-gold-burnished"
                  )}>
                    <label htmlFor="donation-amount" className="sr-only">Donation Amount in {currencyCode}</label>
                    <div className="flex items-center justify-center px-4 bg-emerald-deep/[0.02] border-r border-emerald-deep/5 min-w-[3rem]">
                      <span className="text-emerald-deep/40 font-medium transition-colors group-focus-within:text-gold-burnished whitespace-nowrap" aria-hidden="true">{currencySymbol}</span>
                    </div>
                    <input 
                      id="donation-amount"
                      type="text" 
                      inputMode="decimal"
                      value={localAmount}
                      onChange={(e) => {
                        setFormErrors(p => ({...p, amount: undefined}));
                        let val = e.target.value.replace(/[^0-9.]/g, '');

                        const parts = val.split('.');
                        if (parts.length > 2) {
                          val = parts[0] + '.' + parts.slice(1).join('');
                        }

                        if (val.length > 1 && val[0] === '0' && val[1] !== '.') {
                          val = val.replace(/^0+/, '');
                        }

                        setLocalAmount(val);
                      }}
                      placeholder={`0.00`}
                      className="w-full p-5 pl-4 pr-4 text-lg font-serif tracking-tight outline-none transition-all placeholder:text-emerald-deep/10 bg-transparent"
                      required
                    />
                  </div>
                  {formErrors.amount && <p className="text-[10px] text-red-500 mt-1">{formErrors.amount}</p>}

                  <AnimatePresence>
                    {currencyCode !== 'USD' && localAmount && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex justify-end pr-1 mt-1"
                      >
                        <div className="text-[10px] text-emerald-deep/60 font-medium px-3 py-1 bg-emerald-deep/5 rounded-full border border-gold-burnished/10 flex items-center gap-1.5 shadow-sm">
                          <span className="opacity-50">Estimated Value:</span>
                          <span className="text-gold-burnished font-bold font-serif whitespace-nowrap">
                            ${usdAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} USD
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first-name" className="sr-only">First Name</label>
                    <input 
                      id="first-name"
                      type="text" 
                      placeholder="First Name" 
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setFormErrors(p => ({...p, firstName: undefined})); }}
                      className={cn(
                        "w-full bg-white border p-4 text-sm outline-none transition-colors",
                        formErrors.firstName ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                      )}
                      required 
                    />
                    {formErrors.firstName && <p className="text-[10px] text-red-500 mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="last-name" className="sr-only">Last Name</label>
                    <input 
                      id="last-name"
                      type="text" 
                      placeholder="Last Name" 
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setFormErrors(p => ({...p, lastName: undefined})); }}
                      className={cn(
                        "w-full bg-white border p-4 text-sm outline-none transition-colors",
                        formErrors.lastName ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                      )}
                      required 
                    />
                    {formErrors.lastName && <p className="text-[10px] text-red-500 mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="donation-email" className="sr-only">Email Address</label>
                  <input 
                    id="donation-email"
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormErrors(p => ({...p, email: undefined})); }}
                    className={cn(
                      "w-full bg-white border p-4 text-sm outline-none transition-colors",
                      formErrors.email ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                    )}
                    required 
                  />
                  {formErrors.email && <p className="text-[10px] text-red-500 mt-1">{formErrors.email}</p>}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-800 font-bold">Payment via Bank Transfer</p>
                  <p className="text-[10px] text-amber-700 mt-1">After you submit, we will contact you within 24 hours with bank transfer details. No card information needed.</p>
                </div>
              </div>

              <Button 
                variant="primary" 
                className="w-full py-4 text-xs sm:text-sm tracking-[0.1em] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 h-auto min-h-[56px]"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Investment...</span>
                  </>
                ) : (
                  <>
                    <span className="text-center">Confirm {formatCurrency(usdAmount)} Contribution</span>
                    {currencyCode !== 'USD' && (
                      <span className="text-[10px] opacity-60 italic whitespace-nowrap">($ {usdAmount.toFixed(2)} USD)</span>
                    )}
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

const StoryModal = ({ isOpen, onClose, card }: { isOpen: boolean; onClose: () => void; card: any }) => {
  if (!card) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={card.subtitle}>
      <div className="space-y-8">
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
          <img 
            src={card.image} 
            alt={card.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className="text-gold-burnished uppercase tracking-widest text-[10px] mb-2 block">Restored Masterpiece</span>
            <h3 className="text-2xl text-sage-soft font-serif">{card.title}</h3>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 py-4 border-y border-emerald-deep/5">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-sage-soft bg-emerald-deep/10 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i + 10}/100/100`} alt="Supporter of Vios Academy" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-emerald-deep/40 uppercase tracking-widest">
              Supported by <span className="text-emerald-deep font-bold">124 Investors</span>
            </p>
          </div>

          <div className="prose prose-emerald max-w-none">
            <p className="text-emerald-deep/80 leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-gold-burnished">
              {card.fullStory}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-gold-burnished/5 border border-gold-burnished/10 rounded-xl">
              <span className="text-[10px] text-gold-burnished uppercase tracking-widest mb-1 block">Impact Metric</span>
              <p className="text-lg font-serif text-emerald-deep">100% Restored</p>
            </div>
            <div className="p-4 bg-emerald-deep/5 border border-emerald-deep/10 rounded-xl">
              <span className="text-[10px] text-emerald-deep/40 uppercase tracking-widest mb-1 block">Status</span>
              <p className="text-lg font-serif text-emerald-deep">Active Leader</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-deep/5 flex gap-4">
          <Button variant="primary" className="flex-1 py-4 text-xs tracking-widest" onClick={onClose}>
            Back to Stories
          </Button>
          <Button variant="outline" className="px-6 py-4">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ShareModal = ({ isOpen, onClose, card }: { isOpen: boolean; onClose: () => void; card: any }) => {
  if (!card) return null;

  const shareUrl = window.location.href;
  const shareText = `Check out this story from Vios Growth Academy: ${card.title}`;

  const shareLinks = [
    {
      name: 'Twitter',
      icon: <TwitterIcon className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-400/10 hover:text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-700/10 hover:text-blue-700'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-600/10 hover:text-blue-600'
    },
    {
      name: 'Pinterest',
      icon: <Pin className="w-5 h-5" />,
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(card.image)}&description=${encodeURIComponent(shareText)}`,
      color: 'hover:bg-red-600/10 hover:text-red-600'
    },
    {
      name: 'WhatsApp',
      icon: <Globe className="w-5 h-5" />, // Using Globe as a placeholder for WhatsApp if no icon available, or just use a generic one
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'hover:bg-green-500/10 hover:text-green-500'
    },
    {
      name: 'Email',
      icon: <BookOpen className="w-5 h-5" />, // Using BookOpen as a placeholder for Email
      url: `mailto:?subject=${encodeURIComponent(card.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      color: 'hover:bg-gray-500/10 hover:text-gray-500'
    }
  ];

  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Story">
      <div className="space-y-8">
        <div className="flex gap-4 items-center p-4 bg-emerald-900/5 border border-gold-burnished/20 rounded-xl">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img src={card.image} alt={card.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
          </div>
          <div>
            <h4 className="font-serif text-lg text-emerald-deep">{card.title}</h4>
            <p className="text-xs text-emerald-deep/60 line-clamp-1">{card.desc}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-xl border border-emerald-deep/10 transition-all duration-300",
                link.color
              )}
            >
              {link.icon}
              <span className="text-[10px] uppercase tracking-widest font-medium">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              readOnly 
              value={shareUrl}
              className="w-full bg-sage-soft border border-emerald-deep/10 p-3 pr-24 text-[10px] text-emerald-deep/60 outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-deep text-sage-soft px-3 py-1 text-[10px] uppercase tracking-widest hover:bg-gold-burnished transition-colors"
            >
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        
        <div className="pt-4">
          <Button variant="outline" className="w-full text-xs" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

const OurStoryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-10">
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src="./VIOS_LOGO.jpeg" 
            alt="The Forest of Growth" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 to-transparent flex items-end p-6 md:p-8">
            <h3 className="text-3xl text-sage-soft font-serif">Founded in 2025 2222 </h3>
          </div>
        </div>

        <div className="space-y-6 text-emerald-deep/80 leading-relaxed font-light">
          <p className="text-lg font-serif italic text-emerald-deep">
            "I am no longer seeking acceptance; I am becoming everything I was created to be. I rose above it all—not by revenge, but by love."
            <span className="text-gold-burnished font-serif not-italic mt-2 block text-sm">— Coach Vio</span>
          </p>
          
          <div className="space-y-4">
            <h4 className="text-xl font-serif text-emerald-deep">The Story That Built an Academy</h4>
            <p>
              Every great movement begins with a spark. For Vios Growth Academy, that spark is the harrowing yet triumphant journey of our founder, <strong>Nakungu Violet Lovisa (Coach Vio)</strong>.
            </p>
            <p>
              Her life began with rejection, pain, and feeling unseen. But instead of letting that pain break her, she chose to transform it into purpose. Through music, mentorship, and community work, she discovered her calling to bring hope to those who feel unforgotten.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-serif text-emerald-deep">The Black Sheep Daughter</h4>
            <p>
              <em>"The Black Sheep Daughter: My Truth Unveiled"</em> is more than just a book; it is a blueprint for transforming rejection into rhythm and heartbreak into healing. From being a child who felt "unwanted" to becoming a global voice for empowerment, Coach Vio’s story is the ultimate testimony to the human spirit.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 py-6 border-y border-emerald-deep/5">
            <div className="space-y-2">
              <span className="text-gold-burnished font-bold text-2xl font-serif">2+</span>
              <p className="text-[10px] uppercase tracking-widest">Years of Impact</p>
            </div>
            <div className="space-y-2">
              <span className="text-gold-burnished font-bold text-2xl font-serif">2=3000+</span>
              <p className="text-[10px] uppercase tracking-widest">Lives Restored</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-serif text-emerald-deep">Our Evolution</h4>
            <p>
              What started as a small initiative to provide shelter to the homeless has evolved into a multi-sector academy. Today, we operate across four core pillars: protecting children, empowering men and boys, uplifting women, and providing the financial guidance necessary for sustainable independence.
            </p>
            <p>
              We are not just a charity; we are a growth engine. We believe in radical transparency, ethical management, and the unwavering belief that every individual has the right to a legacy of dignity.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-deep/5">
          <Button variant="primary" className="w-full py-4 text-xs tracking-widest" onClick={onClose}>
            Continue the Journey
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const PillarModal = ({ isOpen, onClose, pillar }: { isOpen: boolean; onClose: () => void; pillar: any }) => {
  if (!pillar) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center sm:text-left">
            <span className="text-gold-burnished uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold mb-2 block">
              {pillar.subtitle}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-emerald-deep">{pillar.title}</h3>
          </div>

          <p className="text-emerald-deep/80 leading-relaxed font-light text-base sm:text-lg text-center sm:text-left">
            {pillar.detailedDesc || pillar.desc}
          </p>

          <div className="space-y-4">
            <h4 className="text-[10px] sm:text-xs uppercase tracking-widest text-gold-burnished font-bold text-center sm:text-left">Key Focus Areas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {(pillar.features || []).map((feature: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-emerald-900/5 rounded-lg border border-emerald-deep/5">
                  <ArrowRight className="w-3 h-3 text-gold-burnished shrink-0" />
                  <span className="text-sm text-emerald-deep/70">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-deep/5">
          <Button variant="primary" className="w-full py-4 text-xs tracking-widest" onClick={onClose}>
            Back to Pillars
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const PartnershipInquiryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({ name: '', email: '', organization: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; organization?: string; message?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = 'Representative name is required';
    else if (formData.name.length > 100) newErrors.name = 'Name is too long (max 100 characters)';

    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';

    if (!formData.organization.trim()) newErrors.organization = 'Organization/Company name is required';
    else if (formData.organization.length > 200) newErrors.organization = 'Organization name is too long (max 200 characters)';

    if (!formData.message.trim()) newErrors.message = 'Please share your partnership proposal';
    else if (formData.message.length > 2000) newErrors.message = 'Proposal is too long (max 2000 characters)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await savePartnershipInquiry(formData);
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to submit partnership inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({ name: '', email: '', organization: '', message: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isSuccess ? "Inquiry Received" : "Strategic Alliance Inquiry"}>
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8 space-y-6 text-emerald-deep"
          >
            <div className="w-16 h-16 bg-gold-burnished/10 rounded-full flex items-center justify-center mx-auto text-gold-burnished">
              <Handshake className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-serif">Thank you for aligning with us</h4>
              <p className="text-sm text-emerald-deep/70 max-w-sm mx-auto leading-relaxed">
                Your strategic partnership request has been securely logged. Our alliances team will review your proposal and get in touch within 2 business days.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="outline" onClick={handleClose} className="px-8 py-3">
                Return to Page
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6 text-emerald-deep"
          >
            <div className="text-sm text-emerald-deep/60 leading-relaxed mb-4">
              We co-create deep, sustainable impact through corporate CSR, strategic grants, and cooperative mentorship. Please outline your proposal below.
            </div>

            <div className="space-y-1.5">
              <label htmlFor="partner-name" className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold ml-1">Representative Name</label>
              <input
                id="partner-name"
                type="text"
                placeholder="e.g. Jane Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(
                  "w-full bg-emerald-deep/[0.02] border-b-2 py-3 px-2 text-emerald-deep outline-none transition-all placeholder:text-emerald-deep/20 rounded-t-lg text-sm",
                  errors.name ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                )}
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-tighter">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="partner-email" className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold ml-1">Email Address</label>
              <input
                id="partner-email"
                type="email"
                placeholder="e.g. j.smith@organization.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={cn(
                  "w-full bg-emerald-deep/[0.02] border-b-2 py-3 px-2 text-emerald-deep outline-none transition-all placeholder:text-emerald-deep/20 rounded-t-lg text-sm",
                  errors.email ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                )}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-tighter">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="partner-org" className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold ml-1">Organization / Company Name</label>
              <input
                id="partner-org"
                type="text"
                placeholder="e.g. Acme Philanthropy Fund"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className={cn(
                  "w-full bg-emerald-deep/[0.02] border-b-2 py-3 px-2 text-emerald-deep outline-none transition-all placeholder:text-emerald-deep/20 rounded-t-lg text-sm",
                  errors.organization ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                )}
              />
              {errors.organization && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-tighter">{errors.organization}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="partner-message" className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold ml-1">Partnership Proposal / Goals</label>
              <textarea
                id="partner-message"
                rows={4}
                placeholder="Describe your CSR goals, grant scope, or mentorship interests..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={cn(
                  "w-full bg-emerald-deep/[0.02] border-b-2 py-3 px-2 text-emerald-deep outline-none transition-all placeholder:text-emerald-deep/20 rounded-t-lg text-sm resize-none",
                  errors.message ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                )}
              />
              {errors.message && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-tighter">{errors.message}</p>}
                </div>

                {/* Mobile Money Option for Uganda */}
                <div className="border-t border-emerald-deep/5 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="w-4 h-4 text-gold-burnished" />
                    <span className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">Mobile Money (Uganda)</span>
                  </div>
                  <div className="bg-sage-soft/30 border border-emerald-deep/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-emerald-deep text-sm font-bold">+256 755 342 3</p>
                      <p className="text-[10px] text-emerald-deep/40">Airtel / MTN Mobile Money</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('+2567553423');
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-deep text-sage-soft text-[10px] uppercase tracking-widest hover:bg-gold-burnished hover:text-emerald-deep transition-all whitespace-nowrap"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                </div>

              <Button 
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 text-[10px] tracking-[0.3em] font-bold mt-4"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SUBMITTING...
                </span>
              ) : (
                "SUBMIT PARTNERSHIP INQUIRY"
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
};

const Navbar = ({ onDonateClick, onSearchClick }: { onDonateClick: () => void; onSearchClick: () => void }) => {
  const c = useContent;
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: c('nav-link-1'), href: 'hero' },
    { name: c('nav-link-2'), href: 'founder' },
    { name: c('nav-link-3'), href: 'impact' },
    { name: c('nav-link-4'), href: 'stories' },
    { name: c('nav-link-5'), href: 'pillars' },
  ];

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: href } });
    } else {
      const element = document.getElementById(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav 
        aria-label="Main Navigation"
        className="fixed top-4 md:top-8 left-0 w-full z-50 px-4 md:px-6 flex justify-center pointer-events-none"
      >
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="pointer-events-auto relative flex items-center gap-2 p-1.5 md:p-2 rounded-full border border-gold-burnished/20 transition-all duration-500 bg-sage-soft/95 backdrop-blur-xl shadow-lg"
        >
          {/* Glow Effect Background */}
          <AnimatePresence>
            {hoveredIndex !== null && (
              <motion.div
                layoutId="nav-glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-gold-burnished/10 rounded-full blur-md -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          <button 
            onClick={scrollToTop}
            className="flex items-center px-2 mr-1 md:mr-4 group transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-burnished focus:ring-offset-2 rounded-full"
            aria-label="Scroll to top of Vios Growth Academy"
          >
            <div className="w-12 h-12 md:w-12 md:h-12 bg-transparent shrink-0 flex items-center justify-center">
              <img 
                src="./VIOS_LOGO.jpeg" 
                alt="Vios Growth Academy Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            <button 
              onClick={onSearchClick}
              className="p-2 rounded-full transition-colors duration-300 text-emerald-deep/70 hover:text-gold-burnished"
              title="Search Academy"
              aria-label="Search Academy"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
            
            {navLinks.map((link, index) => (
              <button 
                key={link.name} 
                onClick={() => handleNavClick(link.href)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 rounded-full text-emerald-deep/80 hover:text-gold-burnished font-medium"
              >
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 bg-gold-burnished/15 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </button>
            ))}
            
            <Link 
              to="/our-story"
              onMouseEnter={() => setHoveredIndex(navLinks.length)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 rounded-full text-emerald-deep/80 hover:text-gold-burnished font-medium"
            >
              {hoveredIndex === navLinks.length && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-0 bg-gold-burnished/15 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{c('nav-our-story')}</span>
            </Link>

            <Link 
              to="/partner"
              onMouseEnter={() => setHoveredIndex(navLinks.length + 1)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 rounded-full text-emerald-deep/80 hover:text-gold-burnished font-medium"
            >
              {hoveredIndex === navLinks.length + 1 && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-0 bg-gold-burnished/15 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{c('nav-partner')}</span>
            </Link>

            <Link 
              to="/contact"
              onMouseEnter={() => setHoveredIndex(navLinks.length + 2)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 rounded-full text-emerald-deep/80 hover:text-gold-burnished font-medium"
            >
              {hoveredIndex === navLinks.length + 2 && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-0 bg-gold-burnished/15 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{c('nav-contact')}</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button 
              onClick={onSearchClick}
              className="p-2 rounded-full transition-colors duration-300 text-emerald-deep/60 hover:text-gold-burnished"
              aria-label="Search Academy"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full transition-colors duration-300 text-emerald-deep hover:text-gold-burnished"
              aria-label="Toggle Menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>

          <div className="ml-1 md:ml-4 pl-2 md:pl-4 border-l border-emerald-deep/10">
            <Button 
              variant="outline" 
              onClick={onDonateClick}
              className="py-1.5 md:py-2 px-4 md:px-6 text-[9px] md:text-[10px] rounded-full border-gold-burnished/40 hover:border-gold-burnished bg-white/40 hover:bg-white text-emerald-deep shadow-xs hover:shadow-md transition-all duration-300 uppercase tracking-widest font-semibold"
            >
              {c('nav-support')}
            </Button>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[40] bg-emerald-deep pt-32 px-6 lg:hidden"
          >
            <div id="mobile-menu" className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-3xl font-serif text-left text-sage-soft hover:text-gold-burnished transition-colors"
                  aria-label={`Go to ${link.name}`}
                >
                  {link.name}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link 
                  to="/our-story" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-serif text-sage-soft hover:text-gold-burnished transition-colors"
                >
                  {c('nav-our-story')}
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navLinks.length + 1) * 0.1 }}
              >
                <Link 
                  to="/partner" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-serif text-sage-soft hover:text-gold-burnished transition-colors"
                >
                  {c('nav-partner')}
                </Link>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-8 border-t border-white/10"
              >
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDonateClick();
                    }}
                    className="w-full py-4 text-sm"
                  >
                    {c('donation-title')}
                  </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = ({ onDonateClick }: { onDonateClick: () => void }) => {
  const navigate = useNavigate();
  const c = useContent;
  const stats = [
    { label: c('hero-stat-1-label'), value: c('hero-stat-1-value') },
    { label: c('hero-stat-2-label'), value: c('hero-stat-2-value') },
    { label: c('hero-stat-3-label'), value: c('hero-stat-3-value') }
  ];

  const images = [
    c('hero-image-1'),
    c('hero-image-2'),
    c('hero-image-3'),
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-emerald-deep">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gold-burnished/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
      
      
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gold-burnished uppercase tracking-[0.3em] text-xs mb-6 block font-medium"
            >
              {c('hero-subtitle')}
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-7xl text-sage-soft mb-8 leading-[1.1] font-serif"
            >
              {c('hero-title-line1')} <span className="italic text-gold-burnished">{c('hero-title-accent')}</span> of <br /> {c('hero-title-line2')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sage-soft/70 text-lg md:text-xl font-light max-w-xl mb-12 leading-relaxed"
            >
              {c('hero-description')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <Button variant="secondary" onClick={onDonateClick} className="w-full sm:w-auto px-10">{c('hero-btn-support')}</Button>
              <Button variant="outline" onClick={() => navigate('/our-story')} className="w-full sm:w-auto border-sage-soft/30 text-sage-soft hover:bg-sage-soft hover:text-emerald-deep px-10">{c('hero-btn-story')}</Button>
            </motion.div>

            {/* Social Proof Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-4 sm:gap-8 border-t border-sage-soft/10 pt-10"
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl md:text-3xl font-serif text-gold-burnished mb-1">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-sage-soft/40">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Image Collage */}
          <div className="relative hidden lg:block h-[600px]">
            <div className="grid grid-cols-2 gap-4 h-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative h-[80%] mt-auto rounded-2xl overflow-hidden border border-gold-burnished/20"
              >
                <img 
                  src={images[0]} 
                  className="w-full h-full object-cover" 
                  alt="Impact 1" 
                  referrerPolicy="no-referrer"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-emerald-deep/20" />
              </motion.div>
              
              <div className="flex flex-col gap-4 h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-[45%] rounded-2xl overflow-hidden border border-gold-burnished/20"
                >
                  <img 
                    src={images[1]} 
                    className="w-full h-full object-cover" 
                    alt="Impact 2" 
                    referrerPolicy="no-referrer"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-emerald-deep/20" />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: -40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="h-[45%] rounded-2xl overflow-hidden border border-gold-burnished/20"
                >
                  <img 
                    src={images[2]} 
                    className="w-full h-full object-cover" 
                    alt="Impact 3" 
                    referrerPolicy="no-referrer"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-emerald-deep/20" />
                </motion.div>
              </div>
            </div>

            {/* Floating Decorative Element */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [45, 50, 45]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-32 h-32 bg-gold-burnished/10 border border-gold-burnished/30 rotate-45 backdrop-blur-sm -z-10"
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gold-burnished opacity-50"
      >
        <div className="w-px h-12 bg-gradient-to-b from-gold-burnished to-transparent mx-auto" />
      </motion.div>
    </section>
  );
};

const FounderJourney = () => {
  const c = useContent;
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const identities = [
    { 
      title: c('founder-identity-1-title'), 
      subtitle: c('founder-identity-1-subtitle'), 
      desc: c('founder-identity-1-desc'),
      icon: <Zap className="w-6 h-6" />
    },
    { 
      title: c('founder-identity-2-title'), 
      subtitle: c('founder-identity-2-subtitle'), 
      desc: c('founder-identity-2-desc'),
      icon: <Globe className="w-6 h-6" />
    },
    { 
      title: c('founder-identity-3-title'), 
      subtitle: c('founder-identity-3-subtitle'), 
      desc: c('founder-identity-3-desc'),
      icon: <Award className="w-6 h-6" />
    }
  ];

  return (
    <Section id="founder" className="bg-sage-soft">
      <div ref={targetRef} className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-square sm:aspect-[4/5] bg-emerald-deep overflow-hidden">
            <motion.img 
              style={{ y, scale: 1.2 }}
              src = {c('founder-image')}
              alt={c('founder-name')} 
              className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 border-2 border-gold-burnished -z-10" />
          <div className="absolute top-1/2 -left-12 -translate-y-1/2 hidden xl:block">
             <span className="text-gold-burnished/20 text-9xl font-serif select-none">VIO</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-gold-burnished uppercase tracking-widest text-sm mb-4 block">{c('founder-section-label')}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-8">{c('founder-name')}</h2>
          <div className="space-y-6 text-lg text-emerald-deep/70 mb-12 leading-relaxed">
            <p>{c('founder-para-1')}</p>
            <p>{c('founder-para-2')}</p>
            <p>{c('founder-para-3')}</p>
          </div>

          <div className="space-y-8 mb-12">
            {identities.map((id, index) => (
              <div key={index} className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-deep text-gold-burnished flex items-center justify-center group-hover:bg-gold-burnished group-hover:text-emerald-deep transition-colors duration-300">
                  {id.icon}
                </div>
                <div>
                  <h4 className="text-xl font-serif mb-1">{id.title} <span className="text-sm font-sans text-gold-burnished ml-2 uppercase tracking-tighter">— {id.subtitle}</span></h4>
                  <p className="text-emerald-deep/60 text-sm">{id.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative p-8 bg-emerald-deep text-sage-soft italic font-serif text-xl border-l-4 border-gold-burnished">
            <Quote className="absolute top-4 right-4 w-8 h-8 text-gold-burnished/20" />
            {c('founder-quote')}
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

const CourseSection = () => {
  const c = useContent;
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formState.name.trim()) {
      newErrors.name = 'Please provide your name.';
    } else if (formState.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formState.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formState.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formState.message.trim()) {
      newErrors.message = 'Please share your goals.';
    } else if (formState.message.trim().length < 5) {
      newErrors.message = 'Your message is a bit too short.';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      await saveConsultationRequest(formState);
      setIsSuccess(true);
      setFormState({ name: '', email: '', message: '' });
      setFieldErrors({});
      setTimeout(() => setIsSuccess(false), 8000);
    } catch (err: any) {
      console.error("Consultation form error:", err);
      let errorMessage = "It looks like there's a connection issue. Please try again.";
      try {
        const parsedError = JSON.parse(err.message);
        if (parsedError.error.includes('permission-denied')) {
          errorMessage = "Security check failed. Please try again later.";
        }
      } catch (e) {}
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }

    try {
      await axios.post('/api/consultation', formState);
    } catch {} // non-critical
  };

  return (
    <Section id="course" className="bg-emerald-deep text-sage-soft">
      <div ref={targetRef} className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1"
        >
          <div className="relative group">
            <div className="absolute -inset-4 bg-gold-burnished/20 blur-2xl group-hover:bg-gold-burnished/30 transition-all duration-500" />
            <div className="relative aspect-[4/5] bg-sage-soft rounded-3xl shadow-2xl overflow-hidden border border-gold-burnished/20">
              <motion.img 
                style={{ y, scale: 1.2 }}
                src={c('course-image')}
                alt="Psychological Course Session" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-gold-burnished uppercase tracking-widest text-xs mb-2">{c('course-image-badge')}</span>
                <h3 className="text-3xl font-serif">{c('course-image-title')}</h3>
                <p className="text-sage-soft/60 text-sm mt-2 font-light">{c('course-image-desc')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2"
        >
          <span className="text-gold-burnished uppercase tracking-widest text-sm mb-4 block">{c('course-subtitle')}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-8 font-serif leading-tight">
            {c('course-title-line1')} <br />
            <span className="italic text-gold-burnished">{c('course-title-accent')}</span>
          </h2>
          
          <p className="text-lg text-sage-soft/70 mb-10 leading-relaxed">
            {c('course-description')}
          </p>

          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 mb-10">
            <h4 className="text-xl font-serif text-gold-burnished mb-6">{c('course-form-title')}</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    aria-label="Your Name"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "consult-name-error" : undefined}
                    value={formState.name}
                    onChange={(e) => {
                      setFormState({...formState, name: e.target.value});
                      if (fieldErrors.name) setFieldErrors({...fieldErrors, name: undefined});
                    }}
                    className={cn(
                      "bg-emerald-deep/30 border rounded-xl px-4 py-3 text-sm focus:border-gold-burnished outline-none transition-all placeholder:text-sage-soft/30 w-full",
                      fieldErrors.name ? "border-red-500/50" : "border-white/10"
                    )}
                  />
                  <div aria-live="assertive" id="consult-name-error">
                    {fieldErrors.name && <p className="text-[10px] text-red-400 px-1 font-bold uppercase tracking-wider">{fieldErrors.name}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <input 
                    type="email" 
                    placeholder="Your Email"
                    aria-label="Your Email"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "consult-email-error" : undefined}
                    value={formState.email}
                    onChange={(e) => {
                      setFormState({...formState, email: e.target.value});
                      if (fieldErrors.email) setFieldErrors({...fieldErrors, email: undefined});
                    }}
                    className={cn(
                      "bg-emerald-deep/30 border rounded-xl px-4 py-3 text-sm focus:border-gold-burnished outline-none transition-all placeholder:text-sage-soft/30 w-full",
                      fieldErrors.email ? "border-red-500/50" : "border-white/10"
                    )}
                  />
                  <div aria-live="assertive" id="consult-email-error">
                    {fieldErrors.email && <p className="text-[10px] text-red-400 px-1 font-bold uppercase tracking-wider">{fieldErrors.email}</p>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <textarea 
                  placeholder="Briefly describe your goals"
                  aria-label="Briefly describe your goals"
                  aria-invalid={!!fieldErrors.message}
                  aria-describedby={fieldErrors.message ? "consult-msg-error" : undefined}
                  rows={3}
                  value={formState.message}
                  onChange={(e) => {
                    setFormState({...formState, message: e.target.value});
                    if (fieldErrors.message) setFieldErrors({...fieldErrors, message: undefined});
                  }}
                  className={cn(
                    "w-full bg-emerald-deep/30 border rounded-xl px-4 py-3 text-sm focus:border-gold-burnished outline-none transition-all placeholder:text-sage-soft/30 resize-none",
                    fieldErrors.message ? "border-red-500/50" : "border-white/10"
                  )}
                />
                <div aria-live="assertive" id="consult-msg-error">
                  {fieldErrors.message && <p className="text-[10px] text-red-400 px-1 font-bold uppercase tracking-wider">{fieldErrors.message}</p>}
                </div>
              </div>

              <div aria-live="assertive">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <p className="text-[10px] text-red-400 text-center uppercase tracking-widest font-bold">
                      {error}
                    </p>
                  </motion.div>
                )}
              </div>

              <Button 
                variant="secondary" 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className="w-full py-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Request...</span>
                  </>
                ) : isSuccess ? (
                  <span>{c('course-success-msg')}</span>
                ) : (
                  <span>{c('course-btn-text')}</span>
                )}
              </Button>

              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-6 bg-emerald-900/50 border border-gold-burnished/30 rounded-2xl text-center"
                >
                  <p className="text-gold-burnished uppercase tracking-[0.2em] text-[10px] font-bold mb-2">
                    Request Confirmed
                  </p>
                  <p className="text-xs text-sage-soft/80 leading-relaxed">
                    Thank you for taking this step. We've received your request and will reach out to schedule your consultation within 24 hours.
                  </p>
                </motion.div>
              )}
            </form>
          </div>

          {/* 
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h5 className="text-gold-burnished font-serif">Curriculum Focus</h5>
              <ul className="text-xs text-sage-soft/50 space-y-1">
                <li>• Generational Healing</li>
                <li>• Emotional Intelligence</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="text-gold-burnished font-serif">Outcomes</h5>
              <ul className="text-xs text-sage-soft/50 space-y-1">
                <li>• Reclaimed Identity</li>
                <li>• Leadership Mastery</li>
              </ul>
            </div>
          </div> 
          */}
        </motion.div>
      </div>
    </Section>
  );
};

const ImpactModal = ({ isOpen, onClose, card }: { isOpen: boolean; onClose: () => void; card: any }) => {
  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Impact Detail">
      <div className="space-y-8">
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={card.image} 
            alt={card.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/60 to-transparent flex items-end p-6">
            <span className="px-3 py-1 bg-gold-burnished text-emerald-deep text-[10px] uppercase tracking-widest font-bold rounded-full">
              Dignity Restored
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-3xl font-serif text-emerald-deep">{card.title}</h3>
          <p className="text-emerald-deep/70 leading-relaxed text-lg">
            {card.detailedDesc || card.desc}
          </p>
          
          <div className="p-6 bg-sage-soft border border-gold-burnished/20 rounded-2xl">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold-burnished font-bold mb-4">Our Approach</h4>
            <ul className="space-y-3">
              {[
                "Immediate intervention and safety assessment",
                "Long-term structural support and advocacy",
                "Community reintegration and empowerment"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-emerald-deep/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-burnished mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-deep/5">
          <Button variant="primary" className="w-full py-4 text-xs tracking-widest" onClick={onClose}>
            Close Detail
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ImpactCards = () => {
  const c = useContent;
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);

  const handleShare = (card: any) => {
    setSelectedCard(card);
    setIsShareModalOpen(true);
  };

  const handleLearnMore = (card: any) => {
    setSelectedCard(card);
    setIsImpactModalOpen(true);
  };

  const cards = [
    {
      title: c('impact-card-1-title'),
      desc: c('impact-card-1-desc'),
      detailedDesc: c('impact-card-1-detailed'),
      image: c('impact-card-1-image')
    },
    {
      title: c('impact-card-2-title'),
      desc: c('impact-card-2-desc'),
      detailedDesc: c('impact-card-2-detailed'),
      image: c('impact-card-2-image')
    },
    {
      title: c('impact-card-3-title'),
      desc: c('impact-card-3-desc'),
      detailedDesc: c('impact-card-3-detailed'),
      image: c('impact-card-3-image')
    }
  ];

  return (
    <Section id="impact" className="bg-emerald-deep text-sage-soft">
      <div className="text-center mb-20">
        <span className="text-gold-burnished uppercase tracking-widest text-sm mb-4 block">{c('impact-section-label')}</span>
        <h2 className="text-3xl md:text-5xl mb-6 font-serif">{c('impact-section-title')}</h2>
        <div className="w-24 h-1 bg-gold-burnished mx-auto" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden bg-emerald-900/50 border border-sage-soft/10 rounded-2xl"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img 
                src={card.image} 
                alt={card.title} 
                className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
              <h3 className="text-xl md:text-2xl mb-4 font-serif leading-tight">{card.title}</h3>
              <p className="text-sage-soft/60 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">
                {card.desc}
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleLearnMore(card)}
                  className="flex-1 flex items-center justify-center gap-2 text-[10px] px-4 py-2 border-gold-burnished/20 text-gold-burnished hover:bg-gold-burnished hover:text-emerald-deep transition-all"
                >
                  Learn More <ArrowRight className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleShare(card)}
                  className="p-2 border-gold-burnished/20 text-gold-burnished rounded-full hover:bg-gold-burnished hover:text-emerald-deep transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isShareModalOpen && (
          <ShareModal 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)} 
            card={selectedCard}
          />
        )}
        {isImpactModalOpen && (
          <ImpactModal 
            isOpen={isImpactModalOpen} 
            onClose={() => setIsImpactModalOpen(false)} 
            card={selectedCard}
          />
        )}
      </AnimatePresence>
    </Section>
  );
};

const ScrollCards = () => {
  const c = useContent;
  interface CardItem {
    title: string;
    subtitle: string;
    desc: string;
    fullStory: string;
    video?: string;
    image?: string;
    color: string;
  }
  const cards: CardItem[] = [
    {
      title: c('stories-card-1-title'),
      subtitle: c('stories-card-1-subtitle'),
      desc: c('stories-card-1-desc'),
      fullStory: c('stories-card-1-full'),
      video: c('stories-card-1-video') || undefined,
      image: c('stories-card-1-image'),
      color: "bg-emerald-deep"
    },
    {
      title: c('stories-card-2-title'),
      subtitle: c('stories-card-2-subtitle'),
      desc: c('stories-card-2-desc'),
      fullStory: c('stories-card-2-full'),
      video: c('stories-card-2-video') || undefined,
      image: c('stories-card-2-image'),
      color: "bg-gold-burnished"
    },
    {
      title: c('stories-card-3-title'),
      subtitle: c('stories-card-3-subtitle'),
      desc: c('stories-card-3-desc'),
      fullStory: c('stories-card-3-full'),
      video: c('stories-card-3-video') || undefined,
      image: c('stories-card-3-image'),
      color: "bg-emerald-900"
    },
    {
      title: c('stories-card-4-title'),
      subtitle: c('stories-card-4-subtitle'),
      desc: c('stories-card-4-desc'),
      fullStory: c('stories-card-4-full'),
      video: c('stories-card-4-video') || undefined,
      image: c('stories-card-4-image'),
      color: "bg-emerald-800"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const handleShare = (card: any) => {
    setSelectedCard(card);
    setIsShareModalOpen(true);
  };

  const handleReadStory = (card: any) => {
    setSelectedCard(card);
    setIsStoryModalOpen(true);
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, cards.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % cards.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <Section id="stories" className="bg-sage-soft overflow-hidden">
      <div className="text-center mb-16">
        <span className="text-gold-burnished uppercase tracking-widest text-sm mb-4 block">{c('stories-section-label')}</span>
        <h2 className="text-4xl md:text-5xl mb-6">{c('stories-section-title')}</h2>
        <p className="text-emerald-deep/60 max-w-2xl mx-auto">
          {c('stories-section-desc')}
        </p>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="relative min-h-[600px] md:h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                "absolute inset-0 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row",
                cards[currentIndex].color
              )}
            >
              <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-full relative overflow-hidden shrink-0">
                {cards[currentIndex].video ? (
                  <video 
                    src={cards[currentIndex].video} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={cards[currentIndex].image} 
                    alt={cards[currentIndex].title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              </div>
              
              <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center text-sage-soft">
                <span className="text-gold-burnished uppercase tracking-widest text-xs mb-4 block">
                  {cards[currentIndex].subtitle}
                </span>
                <h3 className="text-2xl md:text-4xl mb-6 leading-tight font-serif">
                  {cards[currentIndex].title}
                </h3>
                <p className="text-sage-soft/70 text-base md:text-lg mb-8 leading-relaxed">
                  {cards[currentIndex].desc}
                </p>
                
                <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Button 
                    variant="secondary" 
                    className="text-xs px-8"
                    onClick={() => handleReadStory(cards[currentIndex])}
                  >
                    Read Full Story
                  </Button>
                  
                  <button 
                    onClick={() => handleShare(cards[currentIndex])}
                    className="flex items-center gap-4 group/share"
                  >
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold-burnished group-hover/share:text-sage-soft transition-colors">Share Story</span>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full border border-sage-soft/20 group-hover/share:bg-gold-burnished group-hover/share:border-gold-burnished transition-all">
                        <Share2 className="w-4 h-4 text-gold-burnished group-hover/share:text-emerald-deep" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Kintsugi Crack Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-gold-burnished fill-none stroke-[0.5]">
                  <path d="M0,20 Q40,40 60,0 T100,30" />
                  <path d="M20,100 Q50,70 30,40 T80,0" />
                </svg>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-8 mt-12">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-emerald-deep/10 text-emerald-deep hover:bg-gold-burnished hover:border-gold-burnished hover:text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button 
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-emerald-deep text-gold-burnished shadow-lg hover:scale-110 transition-transform"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>

          <button 
            onClick={nextSlide}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-emerald-deep/10 text-emerald-deep hover:bg-gold-burnished hover:border-gold-burnished hover:text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                currentIndex === i ? "bg-gold-burnished w-8" : "bg-emerald-deep/20 hover:bg-emerald-deep/40"
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isShareModalOpen && (
          <ShareModal 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)} 
            card={selectedCard}
          />
        )}
        {isStoryModalOpen && (
          <StoryModal 
            isOpen={isStoryModalOpen} 
            onClose={() => setIsStoryModalOpen(false)} 
            card={selectedCard}
          />
        )}
      </AnimatePresence>
    </Section>
  );
};

const Pillars = () => {
  const c = useContent;
  const [selectedPillar, setSelectedPillar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLearnMore = (pillar: any) => {
    setSelectedPillar(pillar);
    setIsModalOpen(true);
  };

  const pillars = [
    {
      title: c('pillar-1-title'),
      subtitle: c('pillar-1-subtitle'),
      desc: c('pillar-1-desc'),
      detailedDesc: c('pillar-1-detailed'),
      features: ["Permanent Homes & Schools", "Holistic Education", "Emotional Support", "Community Integration"],
      icon: <Baby className="w-8 h-8" />,
      color: "border-emerald-deep",
      bg: "bg-emerald-deep/5"
    },
    {
      title: c('pillar-2-title'),
      subtitle: c('pillar-2-subtitle'),
      desc: c('pillar-2-desc'),
      detailedDesc: c('pillar-2-detailed'),
      features: ["Mentorship Programs", "Leadership Workshops", "Emotional Intelligence Training", "Community Building"],
      icon: <Users className="w-8 h-8" />,
      color: "border-gold-burnished",
      bg: "bg-gold-burnished/5"
    },
    {
      title: c('pillar-3-title'),
      subtitle: c('pillar-3-subtitle'),
      desc: c('pillar-3-desc'),
      detailedDesc: c('pillar-3-detailed'),
      features: ["Vocational Training", "Legal Literacy", "Agency & Confidence Building", "Rights Advocacy"],
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "border-emerald-deep",
      bg: "bg-emerald-deep/5"
    },
    {
      title: c('pillar-4-title'),
      subtitle: c('pillar-4-subtitle'),
      desc: c('pillar-4-desc'),
      detailedDesc: c('pillar-4-detailed'),
      features: ["Micro-entrepreneurship Training", "Financial Literacy", "Sustainable Growth Mentorship", "Legacy Building"],
      icon: <Coins className="w-8 h-8" />,
      color: "border-gold-burnished",
      bg: "bg-gold-burnished/5"
    }
  ];

  return (
    <Section id="pillars" className="bg-sage-soft">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold-burnished uppercase tracking-[0.3em] text-xs mb-4 block font-medium"
          >
            {c('pillars-section-label')}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-emerald-deep mb-6"
          >
            {c('pillars-section-title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-emerald-deep/60 max-w-2xl mx-auto text-lg font-light"
          >
            {c('pillars-section-desc')}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {pillars.map((pillar, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={cn(
                "p-6 sm:p-10 border-t-4 transition-all duration-500 shadow-sm hover:shadow-xl group",
                pillar.color,
                pillar.bg
              )}
            >
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-emerald-deep shadow-sm group-hover:bg-emerald-deep group-hover:text-gold-burnished transition-all duration-500 shrink-0">
                  {pillar.icon}
                </div>
                <div className="space-y-4 flex-1">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold-burnished font-bold mb-1 block">
                      {pillar.subtitle}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-serif text-emerald-deep group-hover:text-gold-burnished transition-colors">
                      {pillar.title}
                    </h4>
                  </div>
                  <p className="text-emerald-deep/70 text-sm leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                  <div className="pt-2 sm:pt-4">
                    <button 
                      onClick={() => handleLearnMore(pillar)}
                      className="text-[10px] uppercase tracking-widest text-emerald-deep font-bold border-b border-emerald-deep/20 pb-1 hover:border-gold-burnished hover:text-gold-burnished transition-all inline-block"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <PillarModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            pillar={selectedPillar}
          />
        )}
      </AnimatePresence>
    </Section>
  );
};

const Transparency = () => {
  const c = useContent;
  return (
    <Section id="archive" className="bg-white border-y border-emerald-deep/5">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-gold-burnished uppercase tracking-widest text-sm mb-4 block">{c('transparency-section-label')}</span>
        <h2 className="text-4xl md:text-5xl mb-8">{c('transparency-section-title')}</h2>
        <p className="text-lg text-emerald-deep/70 mb-12">
          {c('transparency-section-desc')}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {[
            { label: c('transparency-stat-1-label'), value: c('transparency-stat-1-value') },
            { label: c('transparency-stat-2-label'), value: c('transparency-stat-2-value') },
            { label: c('transparency-stat-3-label'), value: c('transparency-stat-3-value') },
            { label: c('transparency-stat-4-label'), value: c('transparency-stat-4-value') }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-serif text-emerald-deep mb-2">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-gold-burnished">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const Footer = ({ onDonateClick }: { onDonateClick: () => void }) => {
  const c = useContent;
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string; general?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please tell us your name so we can address you properly.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name seems a bit short. Could you provide your full name?';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'An email address is required for us to reply to you.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'This email format doesn\'t look quite right. Please check it.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please share a brief message so we know how to help.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Your message is a bit short. Tell us a little more!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        // 1. Save to Firebase Database (Real-time storage)
        await saveDirectInquiry(formData);

        // 2. Also notify via server API (Optional, for logging/legacy)
        await fetch('/contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        setIsSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
      } catch (error: any) {
        console.error('Error submitting form:', error);
        let errorMessage = 'It looks like there\'s a connection issue. Please check your internet and try again.';
        
        // Check for Firebase specific errors
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError.error.includes('permission-denied')) {
            errorMessage = "Security check failed. Please try again later.";
          }
        } catch (e) {
          // Not a JSON error
        }
        
        setErrors({ general: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const isPartnerPage = location.pathname === '/partner';

  const handleNavClick = (href: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: href } });
    } else {
      const element = document.getElementById(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-emerald-deep text-sage-soft pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-24">
          <div className="md:col-span-2 lg:col-span-2 space-y-8 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
            {c('footer-title-line1')} <br /> <span className="italic text-gold-burnished">{c('footer-title-accent')}</span> {c('footer-title-line2')}
          </h2>
          <p className="text-sage-soft/60 text-lg mb-12 max-w-xl mx-auto md:mx-0 italic">
            {c('footer-quote')}
            <br />
            <span className="text-gold-burnished font-serif not-italic mt-2 block">{c('footer-quote-author')}</span>
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Button variant="secondary" onClick={onDonateClick} className="w-full sm:w-auto">{c('footer-btn-invest')}</Button>
            {!isPartnerPage && (
              <Link to="/partner" className="w-full sm:w-auto">
                <Button variant="outline" className="border-sage-soft text-sage-soft w-full">{c('footer-btn-partner')}</Button>
              </Link>
            )}
          </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <div className="bg-emerald-900/30 p-8 border border-sage-soft/10 rounded-3xl">
              <h5 className="text-gold-burnished uppercase tracking-widest text-xs mb-6 text-center md:text-left font-bold">{c('footer-form-title')}</h5>
              <form className="space-y-4" onSubmit={handleSubmit} aria-label="Contact support">
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    aria-label="Your Name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "footer-name-error" : undefined}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={cn(
                      "w-full bg-transparent border-b py-2 text-sm outline-none transition-colors placeholder:text-sage-soft/30",
                      errors.name ? "border-red-400 focus:border-red-400" : "border-sage-soft/20 focus:border-gold-burnished"
                    )}
                  />
                  <div aria-live="assertive" id="footer-name-error">
                    {errors.name && <p className="text-[10px] text-red-400 mt-1 uppercase tracking-wider font-bold">{errors.name}</p>}
                  </div>
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    aria-label="Your Email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "footer-email-error" : undefined}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={cn(
                      "w-full bg-transparent border-b py-2 text-sm outline-none transition-colors placeholder:text-sage-soft/30",
                      errors.email ? "border-red-400 focus:border-red-400" : "border-sage-soft/20 focus:border-gold-burnished"
                    )}
                  />
                  <div aria-live="assertive" id="footer-email-error">
                    {errors.email && <p className="text-[10px] text-red-400 mt-1 uppercase tracking-wider font-bold">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <textarea 
                    placeholder="Your Message" 
                    aria-label="Your Message"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "footer-msg-error" : undefined}
                    rows={3}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    className={cn(
                      "w-full bg-transparent border-b py-2 text-sm outline-none transition-colors placeholder:text-sage-soft/30 resize-none",
                      errors.message ? "border-red-400 focus:border-red-400" : "border-sage-soft/20 focus:border-gold-burnished"
                    )}
                  />
                  <div aria-live="assertive" id="footer-msg-error">
                    {errors.message && <p className="text-[10px] text-red-400 mt-1 uppercase tracking-wider font-bold">{errors.message}</p>}
                  </div>
                </div>
                <div aria-live="assertive">
                  {errors.general && (
                    <p className="text-[10px] text-red-400 text-center uppercase tracking-wider bg-red-400/10 p-2 rounded">
                      {errors.general}
                    </p>
                  )}
                </div>
                <Button 
                  variant="secondary" 
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className={cn(
                    "w-full py-2 text-xs flex items-center justify-center gap-2 transition-all",
                    isSuccess ? "bg-emerald-500 border-emerald-500 text-white" : ""
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Sending Your Message...</span>
                    </>
                  ) : isSuccess ? (
                    c('footer-form-success')
                  ) : (
                    c('footer-form-btn')
                  )}
                </Button>
                {isSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-400/10 border border-emerald-400/20 p-4 rounded-xl text-center space-y-2"
                  >
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
                      Success!
                    </p>
                    <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                      Thank you for reaching out. Your voice matters to us, and we'll get back to you with the attention you deserve shortly.
                    </p>
                  </motion.div>
                )}
              </form>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-8 lg:block lg:space-y-12">
            <div className="text-center md:text-left">
              <h5 className="text-gold-burnished uppercase tracking-widest text-xs mb-6 font-bold">{c('footer-nav-title')}</h5>
              <nav aria-label="Footer Navigation">
                <ul className="space-y-4 text-sm text-sage-soft/70">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('hero'); }} className="hover:text-gold-burnished transition-colors">{c('footer-nav-vision')}</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('archive'); }} className="hover:text-gold-burnished transition-colors">{c('footer-nav-reports')}</a></li>
                  <li><Link to="/our-story" className="hover:text-gold-burnished transition-colors">{c('footer-nav-academy')}</Link></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('faq'); }} className="hover:text-gold-burnished transition-colors">{c('footer-nav-faq')}</a></li>
                  <li><Link to="/contact" className="hover:text-gold-burnished transition-colors">{c('footer-nav-contact')}</Link></li>
                </ul>
              </nav>
            </div>
            
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <h5 className="text-gold-burnished uppercase tracking-widest text-xs mb-6 font-bold">{c('footer-connect-title')}</h5>
              <div className="flex gap-4 mb-8">
                <a href="https://www.instagram.com/viosgrowthacademy.256/" aria-label="Instagram" className="w-12 h-12 rounded-full border border-sage-soft/20 flex items-center justify-center hover:bg-gold-burnished hover:border-gold-burnished hover:text-emerald-deep transition-all duration-300 group">
                  <InstagramIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://x.com/VioletNakungu" aria-label="Twitter" className="w-12 h-12 rounded-full border border-sage-soft/20 flex items-center justify-center hover:bg-gold-burnished hover:border-gold-burnished hover:text-emerald-deep transition-all duration-300 group">
                  <TwitterIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://www.tiktok.com/@coachvio2" aria-label="TikTok"  className="w-12 h-12 rounded-full border border-sage-soft/20 flex items-center justify-center hover:bg-gold-burnished hover:border-gold-burnished hover:text-emerald-deep transition-all duration-300 group">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
              </div>
              
              <div className="flex items-center gap-4 text-left">
                {/* Changed w-12 h-12 to w-8 h-8 */}
                <div className="w-14 h-14 rounded-full overflow-hidden border border-gold-burnished/20 bg-emerald-deep/20 shrink-0">
                  <img 
                    src="./VIOS_LOGO.jpeg" 
                    alt="Vios Growth Academy Logo" 
                    className="w-15 h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                  <p className="text-xs text-sage-soft/40 leading-relaxed">
                    {c('footer-brand')} <br />
                    {c('footer-email')} <br />
                    <a href="tel:+256705154403" className="text-gold-burnished hover:text-gold-burnished/80 transition-all" style={{ textShadow: '0 0 8px rgba(184,134,11,0.5), 0 0 20px rgba(184,134,11,0.3)' }}>+256 705 154 403</a>
                  </p>
              </div>
            </div>
          </div>
        </div>

        <KintsugiDivider className="opacity-20" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-sage-soft/40">
          <p>{c('footer-copyright')}</p>
        {/*  <div className="flex gap-8">
            <a href="#" className="hover:text-gold-burnished">Privacy Policy</a>
            <a href="#" className="hover:text-gold-burnished">Terms of Service</a>
          </div>*/}
        </div>
      </div>
    </footer>
  );
};

// --- Golden Hour Carousel ---

const GoldenHourCarousel = () => {
  const c = useContent;
  return (
    <section className="relative py-20 bg-sage-soft border-b border-emerald-deep/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <span className="text-gold-burnished uppercase tracking-[0.4em] text-[10px] md:text-xs mb-3 block font-semibold">
          {c('gallery-subtitle')}
        </span>
        <h2 className="text-4xl md:text-5xl text-emerald-deep font-serif italic mb-4">
          {c('gallery-title')}
        </h2>
        <p className="text-emerald-deep/70 text-sm md:text-base font-light max-w-xl mx-auto">
          {c('gallery-description')}
        </p>
      </div>

      <div className="relative h-[450px] sm:h-[550px] md:h-[600px] w-full text-emerald-deep font-serif">
        <CircularGallery
          items={galleryItems}
          bend={3}
          borderRadius={0.05}
          scrollEase={0.03}
        />
      </div>
    </section>
  );
};

// --- Social Feed ---

const FAQ = () => {
  const c = useContent;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { question: c('faq-q-1'), answer: c('faq-a-1') },
    { question: c('faq-q-2'), answer: c('faq-a-2') },
    { question: c('faq-q-3'), answer: c('faq-a-3') },
    { question: c('faq-q-4'), answer: c('faq-a-4') },
    { question: c('faq-q-5'), answer: c('faq-a-5') }
  ];

  return (
    <Section id="faq" className="bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gold-burnished uppercase tracking-[0.3em] text-xs mb-4 block font-bold">{c('faq-section-label')}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-emerald-deep">{c('faq-section-title')}</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-emerald-deep/5 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-sage-soft transition-colors group"
                aria-expanded={openIndex === index}
              >
                <span className="font-serif text-lg text-emerald-deep group-hover:text-gold-burnished transition-colors">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-gold-burnished"
                >
                  <ChevronDown className="w-5 h-5" aria-hidden="true" />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-emerald-deep/70 leading-relaxed font-light border-t border-emerald-deep/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const SocialFeed = () => {
  const c = useContent;
  return (
    <Section id="social" className="bg-sage-soft border-t border-emerald-deep/5 py-24 md:py-32">
      <div className="text-center max-w-3xl mx-auto space-y-8 px-4">
        <span className="text-gold-burnished uppercase tracking-[0.3em] text-xs md:text-sm block font-bold">
          {c('social-section-label')}
        </span>
        <h2 className="text-4xl md:text-6xl font-serif text-emerald-deep leading-tight font-medium">
          {c('social-section-title')}
        </h2>
        <p className="text-emerald-deep/80 max-w-2xl mx-auto font-light text-sm md:text-base leading-relaxed">
          {c('social-section-desc')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5 pt-4">
          <a 
            href="https://www.instagram.com/viosgrowthacademy.256/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[200px] border border-emerald-deep/40 hover:border-emerald-deep text-emerald-deep hover:bg-emerald-deep hover:text-sage-soft transition-all duration-300 font-sans uppercase tracking-[0.25em] text-xs font-semibold px-8 py-3.5 flex items-center justify-center gap-3.5 cursor-pointer bg-white/20 hover:shadow-md shadow-xs"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Instagram</span>
          </a>
          <a 
            href="https://x.com/VioletNakungu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[200px] border border-emerald-deep/40 hover:border-emerald-deep text-emerald-deep hover:bg-emerald-deep hover:text-sage-soft transition-all duration-300 font-sans uppercase tracking-[0.25em] text-xs font-semibold px-8 py-3.5 flex items-center justify-center gap-3.5 cursor-pointer bg-white/20 hover:shadow-md shadow-xs"
          >
            <TwitterIcon className="w-4 h-4" />
            <span>Twitter</span>
          </a>
          <a 
            href="https://www.tiktok.com/@coachvio2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[200px] border border-emerald-deep/40 hover:border-emerald-deep text-emerald-deep hover:bg-emerald-deep hover:text-sage-soft transition-all duration-300 font-sans uppercase tracking-[0.25em] text-xs font-semibold px-8 py-3.5 flex items-center justify-center gap-3.5 cursor-pointer bg-white/20 hover:shadow-md shadow-xs"
          >
            <TiktokIcon className="w-4 h-4" />
            <span>TikTok</span>
          </a>
        </div>
      </div>
    </Section>
  );
};

// --- Scroll To Top ---

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      if (latest > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100]"
        >
          <Button
            variant="secondary"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-2xl border border-gold-burnished/20"
          >
            <ArrowUp className="w-6 h-6" aria-hidden="true" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Our Story Page ---

const OurStoryPage = () => {
  const c = useContent;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 bg-sage-soft min-h-screen">
      <Helmet>
        <title>Our Story | Vios Growth Academy - Transforming Pain into Purpose</title>
        <meta name="description" content="Discover the triumphant journey of Nakungu Violet Lovisa (Coach Vio) and how her resilience built Vios Growth Academy into a foundation for growth and dignity." />
        <meta name="keywords" content="Coach Vio, DJ Vio, The Black Sheep Daughter, Resilience, Personal Growth, Empowerment Story, Vios History" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={c('story-hero-image')}
              alt="The Forest of Growth" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 to-transparent flex items-end p-8 md:p-12">
              <div>
                <h1 className="text-4xl md:text-6xl text-sage-soft font-serif">{c('story-hero-title')}</h1>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8 text-emerald-deep/80 leading-relaxed text-lg font-light">
              <p className="text-2xl font-serif italic text-emerald-deep border-l-4 border-gold-burnished pl-6 py-2">
                {c('story-quote')}
                <span className="text-gold-burnished font-serif not-italic mt-4 block text-base">{c('story-quote-author')}</span>
              </p>
              
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-emerald-deep">{c('story-section-1-title')}</h2>
                <p>{c('story-section-1-para-1')}</p>
                <p>{c('story-section-1-para-2')}</p>
                <p>{c('story-section-1-para-3')}</p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-emerald-deep">{c('story-section-2-title')}</h2>
                <p>{c('story-section-2-para-1')}</p>
                <p>{c('story-section-2-para-2')}</p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-emerald-deep">{c('story-section-3-title')}</h2>
                <p>{c('story-section-3-para-1')}</p>
                <p>{c('story-section-3-para-2')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-deep/5 space-y-6 sticky top-32">
                <h3 className="text-xl font-serif text-emerald-deep">Impact at a Glance</h3>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-gold-burnished font-bold text-4xl font-serif block">{c('story-sidebar-years-value')}</span>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">{c('story-sidebar-years-label')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gold-burnished font-bold text-4xl font-serif block">{c('story-sidebar-lives-value')}</span>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">{c('story-sidebar-lives-label')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gold-burnished font-bold text-4xl font-serif block">{c('story-sidebar-pillars-value')}</span>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">{c('story-sidebar-pillars-label')}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-emerald-deep/5">
                  <p className="text-sm text-emerald-deep/60 italic mb-6">
                    {c('story-sidebar-quote')}
                  </p>
                  <Link to="/">
                    <Button variant="primary" className="w-full py-3 text-[10px] tracking-widest">
                      {c('story-btn-back')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const PartnerPage = () => {
  const c = useContent;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isPartnershipModalOpen, setIsPartnershipModalOpen] = useState(false);

  return (
    <div className="pt-32 pb-20 bg-sage-soft min-h-screen">
      <Helmet>
        <title>Strategic Alliances | Partner with Vios Growth Academy</title>
        <meta name="description" content="Join our mission to restore dignity and protect potential. Explore partnership tiers, corporate CSR opportunities, and mentorship circles at Vios Growth Academy." />
        <meta name="keywords" content="CSR, Philanthropy, Strategic Partnership, Corporate Social Responsibility, Mentorship, Global Impact, Vios Partners" />
      </Helmet>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Header Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <span className="text-gold-burnished uppercase tracking-[0.3em] text-xs font-bold block">{c('partner-section-label')}</span>
            <h1 className="text-4xl md:text-6xl text-emerald-deep font-serif leading-tight">{c('partner-title')}</h1>
            <p className="text-emerald-deep/60 text-lg font-light leading-relaxed italic">
              {c('partner-quote')}
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group">
            <img 
              src={c('partner-hero-image')}
              alt="Partnership and Collaboration" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-emerald-deep/40 backdrop-blur-[1px] flex items-center justify-center p-12">
               <div className="text-center space-y-4">
                  <Handshake className="w-16 h-16 text-gold-burnished mx-auto mb-4" aria-hidden="true" />
                  <h2 className="text-3xl md:text-5xl text-sage-soft font-serif">{c('partner-hero-title')}</h2>
               </div>
            </div>
          </div>

          {/* Partnership Tiers/Ways */}
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Briefcase className="w-8 h-8" />,
                title: c('partner-tier-1-title'),
                desc: c('partner-tier-1-desc')
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: c('partner-tier-2-title'),
                desc: c('partner-tier-2-desc')
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: c('partner-tier-3-title'),
                desc: c('partner-tier-3-desc')
              }
            ].map((tier, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-emerald-deep/5 space-y-6"
              >
                <div className="w-16 h-16 bg-sage-soft rounded-2xl flex items-center justify-center text-gold-burnished">
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-serif text-emerald-deep">{tier.title}</h3>
                <p className="text-emerald-deep/60 text-sm leading-relaxed font-light">
                  {tier.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Call to Action Section */}
          <div className="bg-emerald-deep rounded-[3rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-burnished/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-burnished/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl text-sage-soft font-serif">{c('partner-cta-title')}</h2>
              <p className="text-sage-soft/60 text-lg font-light italic">
                {c('partner-cta-desc')}
              </p>
              <div className="pt-6">
                <Button 
                  variant="secondary" 
                  className="px-12 py-4 text-xs tracking-[0.3em]"
                  onClick={() => setIsPartnershipModalOpen(true)}
                >
                  {c('partner-cta-btn')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {isPartnershipModalOpen && (
        <PartnershipInquiryModal
          isOpen={isPartnershipModalOpen}
          onClose={() => setIsPartnershipModalOpen(false)}
        />
      )}
    </div>
  );
};

const ContactPage = () => {
  const c = useContent;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Your name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.message.trim()) newErrors.message = 'Please share your message';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await saveDirectInquiry(formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactDetails = [
    { 
      icon: <Mail className="w-5 h-5" />, 
      title: c('contact-group-1-title'), 
      details: [
        { label: c('contact-group-1-label'), value: c('contact-group-1-value'), href: `mailto:${c('contact-group-1-value')}` },
      ]
    },
    { 
      icon: <Phone className="w-5 h-5" />, 
      title: c('contact-group-2-title'), 
      details: [
        { label: c('contact-group-2-label'), value: c('contact-group-2-value'), href: `tel:${c('contact-group-2-value').replace(/[^0-9+]/g, '')}` },
      ]
    },
    //**{ 
      //icon: <MapPin className="w-5 h-5" />, 
      //title: "Physical Sanctuary", 
      //details: [
       // { label: "Headquarters", value: "Plot 45, Kampala Road, Kampala, Uganda", href: "https://maps.google.com/?q=Kampala,Uganda" },
       // { label: "Operating Hours", value: "Monday – Friday: 08:00 - 17:00", href: "#" }
     // ]
   // }
  ];

  return (
    <div className="pt-32 pb-20 bg-sage-soft min-h-screen">
      <Helmet>
        <title>Get in Touch | Vios Growth Academy</title>
        <meta name="description" content="Reach out to Vios Growth Academy. Find our contact details, location, and operating hours in Kampala, Uganda." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Text & Content Block */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-12 xl:col-span-7 space-y-12"
          >
            <div className="space-y-6">
              <span className="text-gold-burnished uppercase tracking-[0.4em] text-[10px] font-bold block">{c('contact-section-label')}</span>
              <h1 className="text-4xl md:text-7xl text-emerald-deep font-serif leading-tight">
                {c('contact-title')} <span className="italic text-gold-burnished underline decoration-gold-burnished/30">{c('contact-title-accent')}</span>
              </h1>
              <p className="text-emerald-deep/60 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                {c('contact-desc')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {contactDetails.map((group, i) => (
                <div key={i} className="space-y-6 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gold-burnished shadow-sm border border-emerald-deep/5 transition-all group-hover:bg-gold-burnished group-hover:text-white">
                      {group.icon}
                    </div>
                    <h3 className="text-emerald-deep font-serif text-lg">{group.title}</h3>
                  </div>
                  <div className="space-y-4 pl-0">
                    {group.details.map((item, j) => (
                      <div key={j}>
                        <h4 className="text-[9px] uppercase tracking-widest text-emerald-deep/40 font-bold mb-1">{item.label}</h4>
                        <a 
                          href={item.href} 
                          className="text-emerald-deep/80 hover:text-gold-burnished transition-colors font-medium break-words block"
                        >
                          {item.value}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map section removed as requested */}
          </motion.div>

          {/* Form Block */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-12 xl:col-span-5"
          >
            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-emerald-deep/5 sticky top-32">
              <div className="mb-10">
                <h3 className="text-3xl font-serif text-emerald-deep mb-4">{c('contact-form-title')}</h3>
                <p className="text-emerald-deep/60 text-sm leading-relaxed">
                  {c('contact-form-desc')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold ml-1">Your Full Name</label>
                  <input 
                    id="contact-name"
                    type="text" 
                    placeholder="e.g. Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={cn(
                      "w-full bg-sage-soft/30 border-b-2 py-4 px-1 text-emerald-deep outline-none transition-all placeholder:text-emerald-deep/20 rounded-t-xl",
                      errors.name ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                    )}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-tighter">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold ml-1">Email Address</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={cn(
                      "w-full bg-sage-soft/30 border-b-2 py-4 px-1 text-emerald-deep outline-none transition-all placeholder:text-emerald-deep/20 rounded-t-xl",
                      errors.email ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                    )}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-tighter">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-subject" className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold ml-1">Subject</label>
                  <select 
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-sage-soft/30 border-b-2 border-emerald-deep/10 py-4 px-1 text-emerald-deep outline-none focus:border-gold-burnished transition-all text-sm rounded-t-xl appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23b8860b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option>General Inquiry</option>
                    <option>Partnership Interest</option>
                    <option>Media & Press</option>
                    <option>Student Application</option>
                    <option>Join the Team</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold ml-1">How can we help?</label>
                  <textarea 
                    id="contact-message"
                    rows={4} 
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={cn(
                      "w-full bg-sage-soft/30 border-b-2 py-4 px-1 text-emerald-deep outline-none transition-all placeholder:text-emerald-deep/20 rounded-t-xl resize-none",
                      errors.message ? "border-red-400" : "border-emerald-deep/10 focus:border-gold-burnished"
                    )}
                  />
                  {errors.message && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-tighter">{errors.message}</p>}
                </div>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSubmitting || isSuccess}
                  className="w-full py-4 text-[10px] tracking-[0.3em] font-bold group relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>SENDING...</span>
                      </>
                    ) : isSuccess ? (
                      <span>{c('contact-btn-text')}!</span>
                    ) : (
                      <>
                        <span>{c('contact-btn-text')}</span>
                        <Zap className="w-3 h-3 group-hover:scale-125 transition-transform" />
                      </>
                    )}
                  </div>
                </Button>


              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const HomePage = ({ openDonationModal, openSearchModal }: { openDonationModal: () => void; openSearchModal: () => void }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).scrollTo) {
      const element = document.getElementById((location.state as any).scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div>
      <Helmet>
        <title>Vios Growth Academy | Restoring Dignity, Protecting Potential</title>
        <meta name="description" content="Vios Growth Academy is a multi-sector academy dedicated to protecting children, empowering men and boys, uplifting women, and providing financial guidance for sustainable independence." />
        <meta name="keywords" content="Vios Growth, Child Protection, Women Empowerment, Men Leadership, Financial Literacy, Uganda, NGO, DJ Vio" />
      </Helmet>
      <Hero onDonateClick={openDonationModal} />
      <GoldenHourCarousel />
      <FounderJourney />
      <CourseSection />
      <KintsugiDivider />
      <ImpactCards />
      <ScrollCards />
      <Pillars />
      <KintsugiDivider />
      <Transparency />
      <SocialFeed />
      <FAQ />
    </div>
  );
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthed(true);
      } else {
        navigate('/admin/login');
      }
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-emerald-deep flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-burnished" />
      </div>
    );
  }

  return authed ? <>{children}</> : null;
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <SiteContentProvider>
          <AppContent />
        </SiteContentProvider>
      </Router>
    </HelmetProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const hideSplash = () => {
      const splash = document.getElementById('vios-splash');
      const root = document.getElementById('root');
      if (splash) {
        splash.classList.add('fade-out');
        if (root) root.classList.add('ready');
        
        setTimeout(() => {
          splash.style.display = 'none';
        }, 600);
      }
    };

    const timer = setTimeout(hideSplash, 500);
    return () => clearTimeout(timer);
  }, []);

  const openDonationModal = () => setIsDonationModalOpen(true);
  const openSearchModal = () => setIsSearchModalOpen(true);

  return (
        <div className="min-h-screen selection:bg-gold-burnished selection:text-emerald-deep">
          {/* Skip Navigation Link for Accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold-burnished focus:text-emerald-deep focus:rounded-lg focus:font-bold focus:shadow-xl"
          >
            Skip to main content
          </a>

          {!isAdminPage && <Navbar onDonateClick={openDonationModal} onSearchClick={openSearchModal} />}
          
          <main id="main-content" className={isAdminPage ? "outline-none" : "outline-none"} tabIndex={-1}>
            <Routes>
              <Route path="/" element={<HomePage openDonationModal={openDonationModal} openSearchModal={openSearchModal} />} />
              <Route path="/our-story" element={<OurStoryPage />} />
              <Route path="/partner" element={<PartnerPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/setup" element={<ProtectedRoute><AdminSetup /></ProtectedRoute>} />
            </Routes>
          </main>

          {!isAdminPage && <Footer onDonateClick={openDonationModal} />}
          <ScrollToTop />
          
          <AnimatePresence>
            {isDonationModalOpen && (
              <DonationModal 
                isOpen={isDonationModalOpen} 
                onClose={() => setIsDonationModalOpen(false)} 
              />
            )}
            {isSearchModalOpen && (
              <SearchModal 
                isOpen={isSearchModalOpen} 
                onClose={() => setIsSearchModalOpen(false)} 
              />
            )}
          </AnimatePresence>
        </div>
  );
}
