
import React, { useState, useEffect, useRef } from 'react';

// Declaration for the Google Identity Services library
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: CredentialResponse) => void; }) => void;
          renderButton: (parent: HTMLElement, options: { theme: string; size: string; type: string; text: string; shape: string; }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

// Interfaces to type the response and decoded token
interface CredentialResponse {
  credential?: string;
}

interface DecodedToken {
  name?: string;
  picture?: string;
  email?: string;
}

// Function to decode JWT manually
function decodeJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export const Auth: React.FC = () => {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const signInDivRef = useRef<HTMLDivElement>(null);

    const handleSignOut = () => {
        setUser(null);
    };

    const handleCredentialResponse = (response: CredentialResponse) => {
        if (response.credential) {
            const decoded = decodeJwt(response.credential);
            setUser(decoded);
            if (signInDivRef.current) {
                signInDivRef.current.innerHTML = ""; // Hide button after login
            }
        }
    };
    
    useEffect(() => {
        if (user) {
            return;
        }

        const initializeGSI = () => {
            if (window.google?.accounts?.id && signInDivRef.current) {
                if (!process.env.GOOGLE_CLIENT_ID) {
                    console.error("Google Client ID is not configured. Please set process.env.GOOGLE_CLIENT_ID.");
                    if (signInDivRef.current) {
                      signInDivRef.current.innerText = "Google Sign-In no está configurado.";
                      signInDivRef.current.className = "text-red-400 text-sm text-center";
                    }
                    return;
                }
    
                window.google.accounts.id.initialize({
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                });
    
                window.google.accounts.id.renderButton(
                    signInDivRef.current,
                    { theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "pill" }
                );
            }
        }

        // Fix: Cast the result of querySelector to HTMLScriptElement to access the 'onload' property.
        const script = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
        if (script) {
            script.onload = initializeGSI;
        } else if (window.google?.accounts?.id) {
            initializeGSI();
        }

    }, [user]);


    return (
        <div className="flex items-center justify-end">
            {user ? (
                <div className="flex items-center gap-3">
                    <img src={user.picture} alt="User profile" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
                    <div className="text-right">
                        <p className="font-semibold text-gray-100 truncate max-w-[150px] sm:max-w-xs">{user.name}</p>
                        <p className="text-sm text-gray-400 truncate max-w-[150px] sm:max-w-xs">{user.email}</p>
                    </div>
                    <button 
                        onClick={handleSignOut} 
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors ml-2 flex-shrink-0"
                        aria-label="Sign out"
                    >
                        Salir
                    </button>
                </div>
            ) : (
                <div ref={signInDivRef} id="signInDiv" className="h-[40px] w-[200px] flex items-center justify-center"></div>
            )}
        </div>
    );
};
