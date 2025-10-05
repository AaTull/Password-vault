'use client';

import { useState } from 'react';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
}

export default function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeLookalikes, setExcludeLookalikes] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    const excludeChars = excludeLookalikes ? 'il1Lo0O' : '';

    const lowercase = removeExcluded('abcdefghijklmnopqrstuvwxyz', excludeChars);
    const uppercase = removeExcluded('ABCDEFGHIJKLMNOPQRSTUVWXYZ', excludeChars);
    const numbers = includeNumbers ? removeExcluded('0123456789', excludeChars) : '';
    const symbols = includeSymbols ? removeExcluded("!#$%&'()*+,-./:;<=>?@[]^_{|}~", excludeChars) : '';

    if (!lowercase && !uppercase && !numbers && !symbols) {
      setGeneratedPassword('');
      return;
    }

    const pools = [lowercase, uppercase].filter(Boolean) as string[];
    if (numbers) pools.push(numbers);
    if (symbols) pools.push(symbols);

    const combined = pools.join('');

    // Ensure at least one from each selected pool
    let result: string[] = [];
    for (const pool of pools) {
      result.push(randomChar(pool));
    }

    for (let i = result.length; i < length; i++) {
      result.push(randomChar(combined));
    }

    // Shuffle result
    result = shuffle(result);

    const password = result.join('');
    setGeneratedPassword(password);
    onPasswordGenerated?.(password);
  };

  function removeExcluded(source: string, exclude: string): string {
    if (!exclude) return source;
    let s = source;
    for (const ch of exclude) s = s.replaceAll(ch, '');
    return s;
  }

  function randomChar(pool: string): string {
    const idx = secureRandomInt(pool.length);
    return pool.charAt(idx);
  }

  function secureRandomInt(max: number): number {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const copyToClipboard = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      // Auto-clear after ~15 seconds when window is focused
      const clearClipboard = async () => {
        try {
          await navigator.clipboard.writeText('');
        } catch {
          // ignore permission/focus errors
        }
      };
      setTimeout(() => {
        if (document.hasFocus()) {
          void clearClipboard();
        } else {
          const onFocus = () => {
            void clearClipboard();
            window.removeEventListener('focus', onFocus);
          };
          window.addEventListener('focus', onFocus);
        }
      }, 15000);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl border shadow bg-[var(--card)] border-[var(--border)]">
      <h2 className="text-xl font-semibold mb-6">Password Generator</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">
            Length: {length}
          </label>
          <input
            type="range"
            min="8"
            max="50"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="mr-2 accent-indigo-500"
            />
            Include Numbers
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="mr-2 accent-indigo-500"
            />
            Include Symbols
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={excludeLookalikes}
              onChange={(e) => setExcludeLookalikes(e.target.checked)}
              className="mr-2 accent-indigo-500"
            />
            Exclude Look-alikes (il1Lo0O)
          </label>
        </div>
        
        <button
          onClick={generatePassword}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Generate Password
        </button>
        
        {generatedPassword && (
          <div className="mt-4">
            <div className="flex">
              <input
                type="text"
                value={generatedPassword}
                readOnly
                className="flex-1 p-2 rounded-l bg-[var(--card)] border border-[var(--border)]"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 bg-emerald-600 text-white rounded-r hover:bg-emerald-500 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
