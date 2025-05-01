"use client";

import { useState } from "react";
import { checkPasswordStrength } from "@/lib/api";
import { PasswordResponse } from "@/types/password";

const calculateConfidence = (entropy: number): number => {
  // Clamp entropy between 0 and 4, then convert to percentage
  if (entropy >= 4) return 1; // 100%
  if (entropy <= 0) return 0; // 0%
  return entropy / 4; // Linear scale between 0 and 1 (will be converted to percentage in display)
};

const getStrengthColor = (confidence: number) => {
  // Split into three ranges: 0-33% (Red), 34-66% (Orange), 67-100% (Green)
  if (confidence < 0.40) {
    return `bg-gradient-to-r from-red-500 to-red-600`;
  } else if (confidence < 0.75) {
    return `bg-gradient-to-r from-orange-500 to-orange-600`;
  } else {
    return `bg-gradient-to-r from-green-500 to-green-600`;
  }
};

const getStrengthText = (confidence: number) => {
  // Split into three ranges: 0-33% (Weak), 34-66% (Medium), 67-100% (Strong)
  if (confidence < 0.40) {
    return "Weak 🔴";
  } else if (confidence < 0.75) {
    return "Medium 🟠";
  } else {
    return "Strong 🟢";
  }
};

const formatFeatureName = (name: string) => {
  const nameMap: { [key: string]: string } = {
    length: "Password Length",
    num_upper: "Uppercase Letters",
    num_lower: "Lowercase Letters",
    num_digit: "Numbers",
    num_symbol: "Special Characters",
    has_qwerty: "Keyboard Pattern",
    has_123456: "Number Sequence",
    entropy: "Complexity Score"
  };
  return nameMap[name] || name;
};

const formatFeatureValue = (name: string, value: any) => {
  if (name === "has_qwerty" || name === "has_123456") {
    return value === 1 ? "Yes" : "No";
  }
  if (name === "entropy") {
    return value.toFixed(2);
  }
  return value;
};

export default function Home() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<PasswordResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await checkPasswordStrength({ password });
      setResult(res);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Calculate confidence based on entropy when result exists
  const confidence = result ? calculateConfidence(result.features.entropy) : 0;

  const hasTipsToShow = result && (
    result.features.num_upper === 0 ||
    result.features.num_digit === 0 ||
    result.features.num_symbol === 0 ||
    result.features.length < 12 ||
    result.features.has_qwerty === 1 ||
    result.features.has_123456 === 1
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl p-8 rounded-3xl border-2 border-rose-300">
        <div className="space-y-6">
          <div className="text-rose-500 text-lg font-medium border border-rose-300 rounded-full px-4 py-2">
            Input password
          </div>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-rose-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="Enter your password"
          />

          <button
            onClick={handleCheck}
            disabled={loading}
            className="w-full px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-rose-300"
          >
            {loading ? "Checking..." : "Check Strength"}
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {result && (
            <div className="mt-6 p-6 bg-white rounded-2xl border border-rose-300 space-y-6">
              {/* Strength Indicator */}
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {getStrengthText(confidence)}
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStrengthColor(confidence)} transition-all duration-500`}
                    style={{ width: `${(confidence * 100).toFixed(0)}%` }}
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {(confidence * 100).toFixed(0)}% confidence
                </div>
              </div>

              {/* Password Analysis */}
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(result.features).map(([key, val]) => (
                  <div key={key} className="bg-rose-50 p-3 rounded-xl">
                    <div className="text-sm text-rose-700 font-medium">
                      {formatFeatureName(key)}
                    </div>
                    <div className="text-lg font-semibold text-rose-900">
                      {formatFeatureValue(key, val)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Password Tips */}
              {hasTipsToShow && (
                <div className="text-sm text-gray-600 bg-rose-50 p-4 rounded-xl">
                  <div className="font-medium text-rose-700 mb-2">Tips to improve:</div>
                  <ul className="list-disc ml-4 space-y-1">
                    {result.features.num_upper === 0 && (
                      <li>Add uppercase letters</li>
                    )}
                    {result.features.num_digit === 0 && (
                      <li>Include numbers</li>
                    )}
                    {result.features.num_symbol === 0 && (
                      <li>Use special characters (!@#$%^&*)</li>
                    )}
                    {result.features.length < 12 && (
                      <li>Make it longer (aim for 12+ characters)</li>
                    )}
                    {(result.features.has_qwerty === 1 || result.features.has_123456 === 1) && (
                      <li>Avoid common patterns (keyboard rows, number sequences)</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
