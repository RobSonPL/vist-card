
import React, { useState } from 'react';
import { BusinessInfo, DesignTheme, LayoutStyle } from '../types';

interface Props {
  info: BusinessInfo;
  theme: DesignTheme;
  className?: string;
  isPrint?: boolean;
  enableInteractive?: boolean;
}

export const CardRenderer: React.FC<Props> = ({ info, theme, className = '', isPrint = false, enableInteractive = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Tailwind font class mapper
  const getFontClass = (f: string) => {
    switch (f) {
      // Original
      case 'serif': return 'font-serif';
      case 'display': return 'font-display';
      case 'modern': return 'font-modern';
      
      // New additions
      case 'poppins': return 'font-poppins';
      case 'cormorant': return 'font-cormorant';
      case 'raleway': return 'font-raleway';
      case 'oswald': return 'font-oswald';
      case 'greatvibes': return 'font-greatvibes';
      case 'librebaskerville': return 'font-librebaskerville';
      case 'sourcesans': return 'font-sourcesans';
      case 'dmserif': return 'font-dmserif';
      case 'titillium': return 'font-titillium';
      case 'spacegrotesk': return 'font-spacegrotesk';
      
      default: return 'font-sans';
    }
  };

  const fontClass = getFontClass(theme.fontFamily);
  
  // Base style object for dynamic colors
  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
  };

  // Helper to render logo or default icon
  const renderLogo = (defaultIcon: React.ReactNode, maxHeight: string = 'h-12') => {
    if (theme.logoUrl) {
        return <img src={theme.logoUrl} alt="Logo" className={`object-contain w-auto ${maxHeight}`} />;
    }
    return defaultIcon;
  };

  // Helper: Social Media Icons
  const renderSocials = (iconColorClass: string = '') => {
      const { socials } = info;
      // Show icons if they exist or if interactive (so user can see where they would be)
      // For this demo, we assume we show them if data exists. 
      const hasSocials = socials?.facebook || socials?.twitter || socials?.linkedin;
      
      if (!hasSocials) return null;

      const iconStyle = { color: theme.primaryColor };

      return (
          <div className={`flex gap-3 mt-3 no-print ${iconColorClass}`}>
              {socials?.facebook && (
                  <a href={socials.facebook} target="_blank" rel="noopener noreferrer" style={iconStyle} className="hover:opacity-75 transition">
                      <i className="fab fa-facebook-f"></i>
                  </a>
              )}
               {socials?.twitter && (
                  <a href={socials.twitter} target="_blank" rel="noopener noreferrer" style={iconStyle} className="hover:opacity-75 transition">
                      <i className="fab fa-twitter"></i>
                  </a>
              )}
               {socials?.linkedin && (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" style={iconStyle} className="hover:opacity-75 transition">
                      <i className="fab fa-linkedin-in"></i>
                  </a>
              )}
          </div>
      );
  };

  // Helper: Learn More Button
  const renderLearnMoreBtn = (btnClass: string = "") => {
      if (!enableInteractive || isPrint) return null;

      return (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className={`mt-4 text-[10px] uppercase font-bold tracking-widest border px-3 py-1 rounded hover:bg-white hover:bg-opacity-10 transition no-print ${btnClass}`}
            style={{ borderColor: theme.primaryColor, color: theme.textColor }}
          >
              {isExpanded ? 'Mniej' : 'Więcej'}
          </button>
      );
  };

  // Helper: Expanded Content (Bio)
  const renderExpandedContent = () => {
      if (!isExpanded || !info.bio) return null;
      return (
          <div className="mt-4 pt-4 border-t border-gray-500/20 text-xs leading-relaxed opacity-90 animate-in fade-in slide-in-from-top-2 duration-300">
              <p>{info.bio}</p>
          </div>
      );
  };

  // Render content based on layout strategy
  const renderLayout = () => {
    switch (theme.layoutStyle) {
      case LayoutStyle.Luxury:
        return (
          <div className="flex flex-col items-center justify-center min-h-full text-center p-6 border-2 relative" style={{ borderColor: theme.primaryColor }}>
             {/* Decorative element or Logo */}
            <div className="mb-4 flex items-center justify-center">
               {renderLogo(
                   <div className="w-12 h-12 flex items-center justify-center rounded-full border border-current" style={{ color: theme.primaryColor }}>
                        <span className="text-2xl font-display">{info.companyName.charAt(0)}</span>
                   </div>,
                   'h-14'
               )}
            </div>
            
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-1" style={{ color: theme.primaryColor }}>{info.fullName}</h2>
            <p className="text-xs uppercase tracking-widest opacity-80 mb-4">{info.jobTitle}</p>
            
            <div className="w-16 h-[1px] mb-4" style={{ backgroundColor: theme.primaryColor }}></div>
            
            <div className="text-[10px] space-y-1 opacity-90 leading-tight">
               <p>{info.phone} • {info.email}</p>
               <p>{info.website}</p>
               <p>{info.address}</p>
            </div>

            {renderSocials()}
            
            {/* Slogan at absolute bottom if not expanded, or relative if expanded */}
            <p className={`text-[8px] uppercase tracking-[0.2em] opacity-60 mt-4 ${isExpanded ? 'mb-2' : 'absolute bottom-4'}`} style={{ color: theme.secondaryColor }}>{theme.slogan}</p>

            {renderLearnMoreBtn()}
            {renderExpandedContent()}
          </div>
        );

      case LayoutStyle.Bold:
        return (
          <div className="flex min-h-full w-full">
            <div className="w-1/3 min-h-full flex flex-col items-center justify-center p-4 relative" style={{ backgroundColor: theme.primaryColor }}>
               {/* Logo in sidebar */}
               {theme.logoUrl ? (
                   <img src={theme.logoUrl} className="w-full max-h-20 object-contain mb-4 filter brightness-0 invert opacity-90" alt="Logo" />
               ) : (
                   <h1 className="text-4xl font-black transform -rotate-90 text-white opacity-90 whitespace-nowrap">{info.companyName}</h1>
               )}
            </div>
            <div className="w-2/3 min-h-full p-6 flex flex-col justify-center text-right">
               {theme.logoUrl && <h2 className="text-xl font-black mb-4 opacity-10">{info.companyName}</h2>}
               <h2 className="text-3xl font-bold mb-0">{info.fullName}</h2>
               <p className="text-sm font-semibold mb-4 opacity-75" style={{ color: theme.primaryColor }}>{info.jobTitle}</p>
               
               <div className="space-y-1 text-xs font-light">
                 <p>{info.phone}</p>
                 <p>{info.email}</p>
                 <p>{info.website}</p>
                 <p>{info.address}</p>
               </div>
               
               <div className="flex justify-end">
                  {renderSocials()}
               </div>

               <div className="mt-4 pt-4 border-t border-gray-200/20">
                  <p className="text-xs italic opacity-60">{theme.slogan}</p>
               </div>

               {renderLearnMoreBtn("self-end")}
               {renderExpandedContent()}
            </div>
          </div>
        );

      case LayoutStyle.Minimal:
        return (
          <div className="min-h-full w-full p-8 flex flex-col justify-between relative overflow-hidden">
            {theme.accentShape === 'circle' && (
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: theme.primaryColor }}></div>
            )}
            
            <div className="z-10">
                <div className="flex items-center gap-3">
                    {renderLogo(
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryColor }}></span>,
                        'h-8'
                    )}
                    <h3 className="text-lg font-bold tracking-wide">{info.companyName}</h3>
                </div>
            </div>
            
            <div className="z-10 mt-auto">
                <h1 className="text-2xl font-light mb-1">{info.fullName}</h1>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: theme.secondaryColor }}>{info.jobTitle}</p>
                
                <div className="flex flex-wrap gap-4 text-[9px] opacity-70">
                    <span>{info.phone}</span>
                    <span>{info.email}</span>
                    <span>{info.website}</span>
                </div>
                {renderSocials()}
                {renderLearnMoreBtn()}
                {renderExpandedContent()}
            </div>
          </div>
        );

      case LayoutStyle.Tech:
        return (
          <div className="min-h-full w-full p-6 relative flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`}}></div>
            <div className="absolute bottom-0 right-0 w-full h-1" style={{ background: `linear-gradient(to left, ${theme.primaryColor}, ${theme.secondaryColor})`}}></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-mono font-bold">{info.fullName}</h2>
                    <p className="text-xs font-mono" style={{ color: theme.primaryColor }}>{`> ${info.jobTitle}`}</p>
                </div>
                <div className="text-right">
                    {renderLogo(
                         <h3 className="text-sm font-bold opacity-80">{info.companyName}</h3>,
                         'h-10'
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono opacity-80 mt-4 p-3 rounded bg-white/5">
                 <div>M: {info.phone}</div>
                 <div>E: {info.email}</div>
                 <div>W: {info.website}</div>
                 <div>A: {info.address}</div>
            </div>
             
             <div className="flex gap-4 items-center">
                 {renderSocials()}
             </div>

             <p className="mt-4 text-[8px] opacity-50 font-mono text-center">/* {theme.slogan} */</p>
             
             {renderLearnMoreBtn("mx-auto font-mono")}
             <div className="font-mono">
                {renderExpandedContent()}
             </div>
          </div>
        );

      case LayoutStyle.Creative:
        return (
             <div className="min-h-full w-full relative p-6 flex flex-col justify-center">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20" 
                     style={{ backgroundColor: theme.primaryColor, clipPath: 'polygon(20% 0%, 100% 0, 100% 100%, 0% 100%)' }}></div>
                
                <div className="relative z-10 w-full">
                    <div className="mb-4">
                        {theme.logoUrl ? (
                             <img src={theme.logoUrl} className="h-10 object-contain" alt="Logo" />
                        ) : null}
                    </div>

                    <h1 className="text-4xl font-black mb-2 leading-none" style={{ color: theme.layoutStyle === LayoutStyle.Creative ? undefined : theme.primaryColor }}>
                        {info.fullName.split(' ')[0]}<br/>
                        <span style={{ color: theme.primaryColor }}>{info.fullName.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-sm font-medium mb-4 bg-white/10 inline-block px-2 py-1 backdrop-blur-sm rounded">{info.jobTitle}</p>
                    
                    <div className="flex justify-between items-end mt-4">
                        <div className="text-[10px] space-y-0.5 font-bold opacity-80">
                            <p>{info.email}</p>
                            <p>{info.phone}</p>
                            {renderSocials()}
                        </div>
                        <div className="text-right">
                             {!theme.logoUrl && <p className="font-bold text-lg">{info.companyName}</p>}
                        </div>
                    </div>
                    {renderLearnMoreBtn()}
                    {renderExpandedContent()}
                </div>
             </div>
        );

      default: // Corporate
        return (
          <div className="min-h-full w-full flex flex-col p-6">
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                    {renderLogo(
                        <div className="w-8 h-8 rounded bg-current flex items-center justify-center" style={{ color: theme.primaryColor }}>
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                        </div>,
                        'h-10'
                    )}
                    
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider">{info.companyName}</h3>
                        <p className="text-[8px] opacity-60">{theme.slogan}</p>
                    </div>
                </div>
             </div>
             <div>
                <h2 className="text-xl font-bold mb-1">{info.fullName}</h2>
                <p className="text-xs mb-4" style={{ color: theme.primaryColor }}>{info.jobTitle}</p>
                
                <div className="border-t border-gray-500/20 pt-3 flex flex-wrap justify-between text-[9px] opacity-80">
                    <div>
                        <p>{info.phone}</p>
                        <p>{info.email}</p>
                    </div>
                    <div className="text-right">
                        <p>{info.website}</p>
                        <p>{info.address}</p>
                    </div>
                </div>
                {renderSocials()}
                {renderLearnMoreBtn()}
                {renderExpandedContent()}
             </div>
          </div>
        );
    }
  };

  // If expanded, we remove the fixed aspect-ratio to allow growth
  // 'business-card-preview' class sets aspect-ratio. We can override it with inline styles or a wrapper.
  // We use `h-auto min-h-full` to allow expansion.
  
  const containerClasses = isPrint 
    ? `business-card-print relative overflow-hidden ${fontClass}`
    : `business-card-preview relative shadow-2xl rounded-xl ${fontClass} ${className} transition-all duration-300 ease-in-out`;

  // On screen, standard card is fixed aspect ratio (via css class). 
  // If expanded, we want it to grow vertically.
  const dynamicStyle: React.CSSProperties = {
      ...cardStyle,
      height: isExpanded ? 'auto' : undefined,
      aspectRatio: isExpanded ? 'auto' : undefined,
      minHeight: isExpanded ? '55mm' : undefined, // Maintain at least card height
      overflow: isExpanded ? 'visible' : 'hidden'
  };

  return (
    <div className={containerClasses} style={dynamicStyle}>
      {renderLayout()}
    </div>
  );
};
