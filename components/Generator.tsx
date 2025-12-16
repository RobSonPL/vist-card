import React, { useState, useEffect } from 'react';
import { BusinessInfo, DesignTheme, User, SavedProject } from '../types';
import { generateCardDesigns, generateBusinessBio } from '../services/geminiService';
import { CardRenderer } from './CardRenderer';
import { saveProject, updateProject, saveTemplate, getTemplates, deleteTemplate } from '../services/storageService';

interface Props {
  currentUser: User;
  onSaved: () => void;
  initialProject?: SavedProject | null; // For editing
}

// Predefined Industry Templates (Expanded to 18)
const INDUSTRY_TEMPLATES = [
    {
        id: 'fin',
        label: 'Finanse & Prawo',
        icon: 'fa-scale-balanced',
        industry: 'Finanse i Prawo',
        jobTitle: 'Doradca Podatkowy',
        color: 'bg-blue-900 text-white'
    },
    {
        id: 'tech',
        label: 'Technologie & IT',
        icon: 'fa-laptop-code',
        industry: 'Software Development',
        jobTitle: 'Senior Developer',
        color: 'bg-indigo-600 text-white'
    },
    {
        id: 'creative',
        label: 'Design & Sztuka',
        icon: 'fa-palette',
        industry: 'Sztuka i Design',
        jobTitle: 'Art Director',
        color: 'bg-pink-500 text-white'
    },
    {
        id: 'med',
        label: 'Medycyna',
        icon: 'fa-user-doctor',
        industry: 'Medycyna',
        jobTitle: 'Lekarz Specjalista',
        color: 'bg-teal-500 text-white'
    },
    {
        id: 'realestate',
        label: 'Nieruchomości',
        icon: 'fa-house-chimney',
        industry: 'Nieruchomości',
        jobTitle: 'Pośrednik w Obrocie Nieruchomościami',
        color: 'bg-emerald-600 text-white'
    },
    {
        id: 'beauty',
        label: 'Beauty & SPA',
        icon: 'fa-spa',
        industry: 'Beauty & Wellness',
        jobTitle: 'Kosmetolog',
        color: 'bg-rose-400 text-white'
    },
    {
        id: 'food',
        label: 'Gastronomia',
        icon: 'fa-utensils',
        industry: 'Gastronomia i Restauracje',
        jobTitle: 'Szef Kuchni / Właściciel',
        color: 'bg-orange-600 text-white'
    },
    {
        id: 'edu',
        label: 'Edukacja',
        icon: 'fa-graduation-cap',
        industry: 'Edukacja i Nauka',
        jobTitle: 'Wykładowca Akademicki',
        color: 'bg-sky-500 text-white'
    },
    {
        id: 'auto',
        label: 'Motoryzacja',
        icon: 'fa-car',
        industry: 'Motoryzacja i Transport',
        jobTitle: 'Manager Floty',
        color: 'bg-red-700 text-white'
    },
    {
        id: 'arch',
        label: 'Budownictwo',
        icon: 'fa-building',
        industry: 'Budownictwo i Architektura',
        jobTitle: 'Główny Architekt',
        color: 'bg-stone-600 text-white'
    },
    // New Popular Additions
    {
        id: 'fitness',
        label: 'Fitness & Sport',
        icon: 'fa-dumbbell',
        industry: 'Sport i Fitness',
        jobTitle: 'Trener Personalny',
        color: 'bg-lime-600 text-white'
    },
    {
        id: 'photo',
        label: 'Fotografia',
        icon: 'fa-camera',
        industry: 'Fotografia i Video',
        jobTitle: 'Fotograf Ślubny',
        color: 'bg-zinc-800 text-white'
    },
    {
        id: 'marketing',
        label: 'Marketing & PR',
        icon: 'fa-bullhorn',
        industry: 'Marketing i Reklama',
        jobTitle: 'Social Media Manager',
        color: 'bg-purple-600 text-white'
    },
    {
        id: 'events',
        label: 'Eventy & Śluby',
        icon: 'fa-champagne-glasses',
        industry: 'Organizacja Eventów',
        jobTitle: 'Wedding Planner',
        color: 'bg-rose-300 text-white'
    },
    {
        id: 'barber',
        label: 'Barber Shop',
        icon: 'fa-scissors',
        industry: 'Fryzjerstwo Męskie',
        jobTitle: 'Master Barber',
        color: 'bg-slate-700 text-white'
    },
    {
        id: 'psych',
        label: 'Psychologia',
        icon: 'fa-brain',
        industry: 'Psychologia i Terapia',
        jobTitle: 'Psychoterapeuta',
        color: 'bg-teal-700 text-white'
    },
    {
        id: 'services',
        label: 'Usługi Domowe',
        icon: 'fa-screwdriver-wrench',
        industry: 'Usługi Techniczne',
        jobTitle: 'Elektryk / Hydraulik',
        color: 'bg-blue-500 text-white'
    },
    {
        id: 'music',
        label: 'Muzyka & DJ',
        icon: 'fa-music',
        industry: 'Muzyka i Rozrywka',
        jobTitle: 'DJ / Producent Muzyczny',
        color: 'bg-violet-900 text-white'
    }
];

export const Generator: React.FC<Props> = ({ currentUser, onSaved, initialProject }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printCountdown, setPrintCountdown] = useState<number | null>(null);
  const [editTab, setEditTab] = useState<'content' | 'design'>('content');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const [info, setInfo] = useState<BusinessInfo>({
    fullName: '',
    jobTitle: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    industry: '',
    bio: '',
    socials: {
        facebook: '',
        twitter: '',
        linkedin: ''
    }
  });
  const [themes, setThemes] = useState<DesignTheme[]>([]);
  const [userTemplates, setUserTemplates] = useState<DesignTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<DesignTheme | null>(null);

  // Initialize for Editing
  useEffect(() => {
    if (initialProject) {
        setInfo(initialProject.info);
        setSelectedTheme(initialProject.theme);
        setStep(3); // Jump straight to edit
        setShowAdvanced(true);
    }
  }, [initialProject]);

  // Load user templates on mount
  useEffect(() => {
      setUserTemplates(getTemplates());
  }, [step]); // Reload when step changes (e.g. after saving a template)

  useEffect(() => {
    if (printCountdown === null) return;

    if (printCountdown > 0) {
      const timer = setTimeout(() => {
        setPrintCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (printCountdown === 0) {
        // Delay slightly to show "0" or "Printing" before blocking
        const timer = setTimeout(() => {
            window.print();
            setPrintCountdown(null);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [printCountdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInfo({
          ...info,
          socials: {
              ...info.socials,
              [e.target.name]: e.target.value
          }
      });
  };

  const handleTemplateClick = (template: typeof INDUSTRY_TEMPLATES[0]) => {
      setInfo(prev => ({
          ...prev,
          industry: template.industry,
          jobTitle: prev.jobTitle || template.jobTitle
      }));
  };

  const handleGenerateBio = async () => {
      if (!info.fullName || !info.industry) {
          alert("Podaj imię, nazwisko i branżę, aby wygenerować Bio.");
          return;
      }
      setBioLoading(true);
      try {
          const generatedBio = await generateBusinessBio(info);
          setInfo(prev => ({ ...prev, bio: generatedBio }));
      } catch (e) {
          alert("Nie udało się wygenerować opisu.");
      } finally {
          setBioLoading(false);
      }
  };

  const handleGenerate = async (e?: React.FormEvent, append: boolean = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    // Variation hint for second batch focusing on New Age and Minimalist
    const styleHint = append 
        ? "styl New Age, Minimalistyczny, Futurystyczny, Eteryczny, Czysta Typografia" 
        : undefined;

    try {
      const generatedThemes = await generateCardDesigns(info, styleHint);
      if (append) {
          setThemes(prev => [...prev, ...generatedThemes]);
      } else {
          setThemes(generatedThemes);
          setStep(2);
      }
    } catch (err) {
      alert("Wystąpił błąd podczas generowania.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (theme: DesignTheme) => {
    setSelectedTheme(theme);
    setStep(3);
  };

  const handleSave = () => {
    if (selectedTheme) {
      if (initialProject) {
          // Editing existing
          updateProject(initialProject.id, info, selectedTheme);
      } else {
          // Creating new
          saveProject(info, selectedTheme, currentUser.email);
      }
      onSaved(); 
    }
  };

  const handleSaveTemplate = () => {
      if (selectedTheme) {
          // Clone theme with new name to avoid reference issues
          const templateToSave = { ...selectedTheme, name: `${selectedTheme.name} (Szablon)` };
          saveTemplate(templateToSave, currentUser.email);
          alert("Szablon został zapisany! Możesz go znaleźć w kroku 'Wybierz swój styl' przy następnym tworzeniu.");
          setUserTemplates(getTemplates()); // refresh
      }
  };

  const handleDownloadPng = () => {
      // @ts-ignore
      if (typeof html2canvas === 'undefined') {
          alert("Błąd biblioteki obrazów.");
          return;
      }

      const element = document.getElementById('card-preview-container');
      if (element) {
        // @ts-ignore
        html2canvas(element, { 
            scale: 4, 
            useCORS: true, 
            backgroundColor: null // transparent background if card has radius/transparency
        }).then((canvas: HTMLCanvasElement) => {
            const link = document.createElement('a');
            link.download = `wizytowka-${info.companyName || 'projekt'}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        }).catch((err: any) => {
            console.error(err);
            alert("Błąd podczas pobierania PNG.");
        });
      }
  };

  const handlePrint = () => {
    setPrintCountdown(3);
  };

  const handleDownloadPdf = () => {
    setPdfGenerating(true);
    const element = document.getElementById('pdf-content');
    
    // Using global html2pdf from CDN
    // @ts-ignore
    if (typeof html2pdf === 'undefined') {
        alert("Błąd biblioteki PDF. Spróbuj użyć opcji Drukowania -> Zapisz jako PDF.");
        setPdfGenerating(false);
        return;
    }

    const opt = {
      margin: 0,
      filename: `wizytowki-${info.companyName || 'projekt'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => {
        setPdfGenerating(false);
    }).catch((err: any) => {
        console.error(err);
        setPdfGenerating(false);
        alert("Wystąpił błąd podczas generowania PDF.");
    });
  };

  const handleThemeEdit = (key: keyof DesignTheme, value: string) => {
    if (selectedTheme) {
        setSelectedTheme({ ...selectedTheme, [key]: value });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedTheme) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleThemeEdit('logoUrl', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleDeleteTemplate = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm('Usunąć ten szablon?')) {
          deleteTemplate(id);
          setUserTemplates(getTemplates());
      }
  };

  // PRINT PREVIEW COMPONENT
  if (showPrintPreview && selectedTheme) {
      return (
          <div className="fixed inset-0 bg-gray-900/95 z-50 flex flex-col overflow-auto">
              {/* Countdown Overlay */}
              {printCountdown !== null && (
                  <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center text-white backdrop-blur-sm no-print">
                      <div className="text-9xl font-bold mb-8 animate-pulse text-gold-500">
                          {printCountdown > 0 ? printCountdown : <i className="fas fa-print"></i>}
                      </div>
                      <h2 className="text-3xl font-display font-bold">
                          {printCountdown > 0 ? 'Przygotowywanie do druku...' : 'Drukowanie...'}
                      </h2>
                      <p className="text-gray-400 mt-2">Proszę czekać</p>
                  </div>
              )}

              <div className="p-4 flex flex-col md:flex-row justify-between items-center text-white container mx-auto no-print gap-4">
                  <div>
                    <h2 className="text-xl font-bold">Podgląd Wydruku (A4)</h2>
                    <p className="text-xs text-gray-400">10 wizytówek (85x55mm) na arkuszu A4</p>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={() => setShowPrintPreview(false)} className="px-4 py-2 rounded hover:bg-white/10 transition">
                          Wróć do edycji
                      </button>
                       <button 
                            onClick={handleDownloadPdf} 
                            disabled={pdfGenerating}
                            className="px-6 py-2 bg-gray-700 text-white font-bold rounded shadow hover:bg-gray-600 transition flex items-center gap-2"
                        >
                          {pdfGenerating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-pdf"></i>}
                          Zapisz jako PDF
                      </button>
                      <button onClick={handlePrint} className="px-6 py-2 bg-gold-500 text-white font-bold rounded shadow hover:bg-gold-700 transition flex items-center gap-2">
                          <i className="fas fa-print"></i> Drukuj
                      </button>
                  </div>
              </div>

              <div className="flex-grow flex justify-center p-8 overflow-y-auto no-print">
                  {/* Screen Preview - Must match A4 metrics exactly for html2pdf */}
                  {/* Padding Top 11mm, Padding Left 20mm matches CSS Print math */}
                  <div 
                    id="pdf-content"
                    className="bg-white shadow-2xl pt-[11mm] pl-[20mm] w-[210mm] min-h-[297mm] grid grid-cols-2 grid-rows-5 gap-0 content-start relative"
                  >
                       {/* Render crop marks visualization for screen preview */}
                      {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="w-[85mm] h-[55mm] outline outline-1 outline-dashed outline-gray-200 relative">
                              <CardRenderer info={info} theme={selectedTheme} isPrint={true} />
                          </div>
                      ))}
                  </div>
              </div>

              {/* ACTUAL PRINT DOM STRUCTURE (Hidden on screen, visible on print) */}
              <div className="print-only">
                  <div className="print-sheet">
                       {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="business-card-print-container">
                              <CardRenderer info={info} theme={selectedTheme} isPrint={true} />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  // STEP 1: INPUT FORM
  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Stwórz swoją wizytówkę</h2>
            <p className="text-gray-500">Wprowadź dane lub wybierz szablon branżowy, a AI przygotuje 6 propozycji premium.</p>
        </div>

        {/* Industry Templates */}
        <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Popularne Branże (Szybki Start)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {INDUSTRY_TEMPLATES.map(template => (
                    <button 
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateClick(template)}
                        className={`p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition text-center group ${info.industry === template.industry ? 'ring-2 ring-gold-500 bg-gray-50' : 'bg-white'}`}
                    >
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 text-white ${template.color}`}>
                            <i className={`fas ${template.icon}`}></i>
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-700 block whitespace-nowrap overflow-hidden text-ellipsis">{template.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <form onSubmit={(e) => handleGenerate(e)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imię i Nazwisko</label>
                    <input required name="fullName" value={info.fullName} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition" placeholder="Jan Kowalski" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stanowisko</label>
                    <input required name="jobTitle" value={info.jobTitle} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition" placeholder="CEO / Graphic Designer" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                    <input required name="companyName" value={info.companyName} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition" placeholder="Acme Corp" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branża (dla AI)</label>
                    <input required name="industry" value={info.industry} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition" placeholder="Finanse, Tech, Art..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input required name="email" value={info.email} onChange={handleInputChange} type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition" placeholder="jan@example.com" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input name="phone" value={info.phone} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition" placeholder="+48 123 456 789" />
                </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Strona WWW</label>
                        <input name="website" value={info.website} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition" placeholder="www.twojastrona.pl" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adres (Opcjonalnie)</label>
                        <input name="address" value={info.address} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition" placeholder="Warszawa, Złota 44" />
                    </div>
                 </div>
            </div>

            {/* Advanced Section */}
            <div className="border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center text-sm font-bold text-gray-500 hover:text-gold-700 transition">
                    <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'} mr-2`}></i>
                    Opcje Dodatkowe (Social Media & Bio)
                </button>

                {showAdvanced && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Krótkie Bio / O Mnie</label>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateBio} 
                                    disabled={bioLoading}
                                    className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded hover:bg-gold-200 transition"
                                >
                                    {bioLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-wand-magic-sparkles mr-1"></i> Napisz z AI</>}
                                </button>
                             </div>
                             <textarea name="bio" value={info.bio} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition h-20" placeholder="Ekspert z 10-letnim doświadczeniem..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1"><i className="fab fa-facebook mr-1"></i> Facebook URL</label>
                                <input name="facebook" value={info.socials?.facebook} onChange={handleSocialChange} type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-gold-500 outline-none" placeholder="https://facebook.com/..." />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1"><i className="fab fa-twitter mr-1"></i> Twitter URL</label>
                                <input name="twitter" value={info.socials?.twitter} onChange={handleSocialChange} type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-gold-500 outline-none" placeholder="https://twitter.com/..." />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1"><i className="fab fa-linkedin mr-1"></i> LinkedIn URL</label>
                                <input name="linkedin" value={info.socials?.linkedin} onChange={handleSocialChange} type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-gold-500 outline-none" placeholder="https://linkedin.com/in/..." />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        <i className="fas fa-circle-notch fa-spin"></i> Generowanie Projektów...
                    </>
                ) : (
                    <>
                        <i className="fas fa-magic"></i> Generuj 6 Propozycji Premium
                    </>
                )}
            </button>
        </form>
      </div>
    );
  }

  // STEP 2: SELECT THEME
  if (step === 2) {
    return (
      <div className="container mx-auto pb-12">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-gray-900">Wybierz swój styl</h2>
            <p className="text-gray-500">AI wygenerowało te unikalne projekty dla Ciebie. Wybierz jeden, aby edytować szczegóły.</p>
            <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-500 hover:text-gold-500 underline">Wróć do edycji danych</button>
        </div>
        
        {/* User Templates Section */}
        {userTemplates.length > 0 && (
            <div className="mb-12">
                 <h3 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-gold-500">Twoje Zapisane Szablony</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {userTemplates.map((template) => (
                        <div key={template.id} className="group relative">
                            <div onClick={() => handleSelect(template)} className="cursor-pointer transform group-hover:scale-105 transition duration-300 border-2 border-gold-500/20 rounded-xl overflow-hidden">
                                <CardRenderer info={info} theme={template} enableInteractive={false} />
                            </div>
                            <div className="mt-2 flex justify-between items-center px-2">
                                <h3 className="font-bold text-sm text-gray-800">{template.name}</h3>
                                <button onClick={(e) => handleDeleteTemplate(e, template.id)} className="text-red-400 hover:text-red-600">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="my-8 border-t border-gray-200"></div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {themes.map((theme) => (
                <div key={theme.id} className="group relative">
                    <div onClick={() => handleSelect(theme)} className="cursor-pointer transform group-hover:scale-105 transition duration-300">
                        <CardRenderer info={info} theme={theme} enableInteractive={false} />
                    </div>
                    <div className="mt-3 flex justify-between items-center px-2">
                        <div>
                             <h3 className="font-bold text-gray-800">{theme.name}</h3>
                             <p className="text-xs text-gray-500 uppercase">{theme.layoutStyle}</p>
                        </div>
                        <button onClick={() => handleSelect(theme)} className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs hover:bg-gold-500 transition">
                            Edytuj i Zapisz
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* Load More Button - SPECIFIC NEW AGE / MINIMALIST REQUEST */}
        <div className="text-center">
            <button 
                onClick={() => handleGenerate(undefined, true)} 
                disabled={loading}
                className="bg-white border-2 border-gold-500 text-gold-700 font-bold py-3 px-8 rounded-full hover:bg-gold-500 hover:text-white transition shadow-lg transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
            >
                {loading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Generowanie...</>
                ) : (
                    <><i className="fas fa-plus"></i> Załaduj 6 kolejnych (New Age & Minimal)</>
                )}
            </button>
        </div>
      </div>
    );
  }

  // STEP 3: PREVIEW & EDIT
  if (step === 3 && selectedTheme) {
    return (
      <div className="max-w-6xl mx-auto">
          {!initialProject && (
            <button onClick={() => setStep(2)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                <i className="fas fa-arrow-left"></i> Wróć do wyboru
            </button>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
             
             {/* Left: Preview Area */}
             <div className="w-full lg:w-1/2 p-8 bg-gray-50 flex flex-col justify-start items-center border-r border-gray-200 overflow-y-auto">
                 <div className="mb-4 w-full flex flex-col items-center">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Podgląd na żywo</h3>
                     <div id="card-preview-container" className="transform scale-110 mb-8 transition-all duration-300">
                        {/* Interactive enabled here for Learn More/Expand */}
                        <CardRenderer info={info} theme={selectedTheme} className="shadow-2xl" enableInteractive={true} />
                     </div>
                     
                     {/* Added Action Toolbar for .business-card-preview context */}
                     <div className="flex gap-2 mb-8">
                         <button 
                             onClick={handleDownloadPng}
                             className="text-xs flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 hover:text-gray-900 transition text-gray-600 shadow-sm"
                             title="Pobierz wizualizację jako PNG"
                         >
                             <i className="fas fa-image"></i> Pobierz PNG
                         </button>
                         <button 
                             onClick={handleSaveTemplate}
                             className="text-xs flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 hover:text-gold-600 transition text-gray-600 shadow-sm"
                             title="Zapisz ten układ jako szablon"
                         >
                             <i className="fas fa-bookmark"></i> Zapisz Szablon
                         </button>
                     </div>

                 </div>
                 <div className="mt-auto w-full max-w-sm">
                      <button onClick={() => setShowPrintPreview(true)} className="w-full py-3 bg-white text-gray-900 border-2 border-gray-200 font-bold rounded-lg hover:border-gold-500 hover:text-gold-700 transition flex items-center justify-center gap-2 mb-3">
                        <i className="fas fa-print"></i> Podgląd Wydruku A4 / PDF
                    </button>
                     <button onClick={handleSave} className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gold-500 transition shadow-lg flex items-center justify-center gap-2">
                        <i className="fas fa-save"></i> {initialProject ? 'Zaktualizuj Projekt' : 'Zapisz Projekt'}
                    </button>
                 </div>
             </div>

             {/* Right: Edit Panel */}
             <div className="w-full lg:w-1/2 flex flex-col">
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setEditTab('content')}
                        className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition ${editTab === 'content' ? 'text-gold-700 border-b-2 border-gold-500 bg-gold-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Treść
                    </button>
                    <button 
                        onClick={() => setEditTab('design')}
                        className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition ${editTab === 'design' ? 'text-gold-700 border-b-2 border-gold-500 bg-gold-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Wygląd & Logo
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 h-full max-h-[600px]">
                    {editTab === 'content' ? (
                        <div className="space-y-4">
                            <h3 className="font-display font-bold text-xl mb-4">Edytuj dane wizytówki</h3>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Imię i Nazwisko</label>
                                <input type="text" name="fullName" value={info.fullName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Stanowisko</label>
                                <input type="text" name="jobTitle" value={info.jobTitle} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Firma</label>
                                <input type="text" name="companyName" value={info.companyName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                    <input type="text" name="email" value={info.email} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Telefon</label>
                                    <input type="text" name="phone" value={info.phone} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none" />
                                </div>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Strona WWW</label>
                                <input type="text" name="website" value={info.website} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Adres</label>
                                <input type="text" name="address" value={info.address} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none" />
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="font-bold text-sm text-gray-800 mb-4">Social Media & Bio</h4>
                                <div className="space-y-3">
                                     <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Facebook</label>
                                        <input type="text" name="facebook" value={info.socials?.facebook || ''} onChange={handleSocialChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none text-sm" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Twitter</label>
                                        <input type="text" name="twitter" value={info.socials?.twitter || ''} onChange={handleSocialChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none text-sm" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">LinkedIn</label>
                                        <input type="text" name="linkedin" value={info.socials?.linkedin || ''} onChange={handleSocialChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none text-sm" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Bio</label>
                                            <button 
                                                type="button" 
                                                onClick={handleGenerateBio}
                                                disabled={bioLoading}
                                                className="text-[10px] text-gold-700 hover:underline"
                                            >
                                                {bioLoading ? "Piszę..." : "Napisz z AI"}
                                            </button>
                                        </div>
                                        <textarea name="bio" value={info.bio} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none text-sm h-24" placeholder="Krótki opis..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                             <h3 className="font-display font-bold text-xl mb-4">Personalizacja Stylu</h3>

                             {/* LOGO UPLOAD */}
                             <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                <label className="block text-center cursor-pointer">
                                    <span className="text-xs font-bold text-gold-500 uppercase block mb-1">
                                        <i className="fas fa-cloud-upload-alt mr-2"></i>
                                        Wgraj Logo Firmy
                                    </span>
                                    <span className="text-[10px] text-gray-400 block mb-2">Max 2MB (PNG/JPG)</span>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </label>
                                {selectedTheme.logoUrl && (
                                    <div className="mt-2 text-center">
                                        <img src={selectedTheme.logoUrl} alt="Logo Preview" className="h-8 mx-auto object-contain" />
                                        <button 
                                            onClick={() => handleThemeEdit('logoUrl', '')} 
                                            className="text-[10px] text-red-500 hover:underline mt-1"
                                        >
                                            Usuń logo
                                        </button>
                                    </div>
                                )}
                             </div>
                             
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Slogan</label>
                                <input type="text" value={selectedTheme.slogan} onChange={(e) => handleThemeEdit('slogan', e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1 focus:border-gold-500 outline-none" />
                            </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Kolor Główny</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={selectedTheme.primaryColor} onChange={(e) => handleThemeEdit('primaryColor', e.target.value)} className="h-10 w-10 p-0 border-0 rounded cursor-pointer" />
                                        <span className="text-xs text-gray-400 font-mono">{selectedTheme.primaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Kolor Tła</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={selectedTheme.backgroundColor} onChange={(e) => handleThemeEdit('backgroundColor', e.target.value)} className="h-10 w-10 p-0 border-0 rounded cursor-pointer" />
                                        <span className="text-xs text-gray-400 font-mono">{selectedTheme.backgroundColor}</span>
                                    </div>
                                </div>
                                 <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Kolor Tekstu</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={selectedTheme.textColor} onChange={(e) => handleThemeEdit('textColor', e.target.value)} className="h-10 w-10 p-0 border-0 rounded cursor-pointer" />
                                        <span className="text-xs text-gray-400 font-mono">{selectedTheme.textColor}</span>
                                    </div>
                                </div>
                                 <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Kolor Dodatkowy</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={selectedTheme.secondaryColor} onChange={(e) => handleThemeEdit('secondaryColor', e.target.value)} className="h-10 w-10 p-0 border-0 rounded cursor-pointer" />
                                        <span className="text-xs text-gray-400 font-mono">{selectedTheme.secondaryColor}</span>
                                    </div>
                                </div>
                             </div>

                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Czcionka</label>
                                <select value={selectedTheme.fontFamily} onChange={(e) => handleThemeEdit('fontFamily', e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-gold-500 outline-none text-sm">
                                    <optgroup label="Klasyczne">
                                        <option value="sans">Inter (Standard Sans)</option>
                                        <option value="serif">Playfair (Standard Serif)</option>
                                        <option value="display">Cinzel (Luxury Display)</option>
                                        <option value="modern">Montserrat (Modern Sans)</option>
                                    </optgroup>
                                    <optgroup label="Premium - Sans Serif">
                                        <option value="poppins" className="font-poppins">Poppins (Geometric)</option>
                                        <option value="raleway" className="font-raleway">Raleway (Elegant)</option>
                                        <option value="oswald" className="font-oswald">Oswald (Condensed)</option>
                                        <option value="sourcesans" className="font-sourcesans">Source Sans 3 (Professional)</option>
                                        <option value="titillium" className="font-titillium">Titillium Web (Tech)</option>
                                        <option value="spacegrotesk" className="font-spacegrotesk">Space Grotesk (Modern Tech)</option>
                                    </optgroup>
                                    <optgroup label="Premium - Serif & Script">
                                        <option value="cormorant" className="font-cormorant">Cormorant Garamond (Elegant)</option>
                                        <option value="librebaskerville" className="font-librebaskerville">Libre Baskerville (Classic)</option>
                                        <option value="dmserif" className="font-dmserif">DM Serif Display (Bold)</option>
                                        <option value="greatvibes" className="font-greatvibes">Great Vibes (Script)</option>
                                    </optgroup>
                                </select>
                             </div>
                        </div>
                    )}
                </div>
             </div>
          </div>
      </div>
    );
  }

  return null;
};