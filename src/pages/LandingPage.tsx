import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Volume2,
  BarChart3,
  Sparkles,
  Target,
  Globe,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelect from "@/components/LanguageSelect";
import { useState } from "react";

const LandingPage = () => {
  const { loginWithGoogle } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-orange-600" />,
      title: t("instantCapture"),
      description: t("instantCaptureDesc")
    },
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: t("smartOrganization"),
      description: t("smartOrganizationDesc")
    },
    {
      icon: <Volume2 className="h-8 w-8 text-green-600" />,
      title: t("authenticPronunciation"),
      description: t("authenticPronunciationDesc")
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: t("realTimeStats"),
      description: t("realTimeStatsDesc")
    }
  ];

  const benefits = [
    t("instantTranslation"),
    t("englishFrenchSupport"),
    t("modernInterface"),
    t("bookOrganization"),
    t("realTimeSync"),
    t("completelyFree")
  ];

  // Palavras de exemplo baseadas no idioma selecionado
  const exampleWords = {
    english: [
      { word: "Serendipity", translation: "Casualidade feliz", status: "New", color: "orange" },
      { word: "Eloquent", translation: "Eloquente", status: "Learning", color: "blue" },
      { word: "Resilient", translation: "Resiliente", status: "Mastered", color: "green" }
    ],
    french: [
      { word: "Sérendipité", translation: "Casualidade feliz", status: "New", color: "orange" },
      { word: "Éloquent", translation: "Eloquente", status: "Learning", color: "blue" },
      { word: "Résilient", translation: "Resiliente", status: "Mastered", color: "green" }
    ],
    portuguese: [
      { word: "Serendipity", translation: "Casualidade feliz", status: "New", color: "orange" },
      { word: "Eloquent", translation: "Eloquente", status: "Learning", color: "blue" },
      { word: "Resilient", translation: "Resiliente", status: "Mastered", color: "green" }
    ]
  };

  const currentExamples = exampleWords[currentLanguage] || exampleWords.english;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-500/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Language Select */}
        <div className="absolute top-6 right-6 z-10">
          <LanguageSelect variant="compact" showPortuguese={true} />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  {t("landingBadge")}
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-slate-800 leading-tight">
                  {t("landingTitle1")}
                  <span className="text-blue-600 block">{t("landingTitle2")}</span>
                  <span className="text-blue-600">
                    {t("landingTitle3")}
                  </span>
                </h1>

                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  {t("landingSubtitle")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-white">{t("signingIn")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-white">{t("loginWithGoogle")}</span>
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {t("free")}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {t("noAds")}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {t("secureData")}
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Vocab Master</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentExamples.map((example, index) => {
                      const IconComponent = index === 0 ? Sparkles : index === 1 ? Brain : CheckCircle;
                      return (
                        <div key={index} className={`flex items-center gap-3 p-3 bg-${example.color}-500/10 border border-${example.color}-500/20 rounded-lg`}>
                          <IconComponent className={`h-5 w-5 text-${example.color}-600`} />
                          <div>
                            <div className="font-medium text-slate-800">{example.word}</div>
                            <div className="text-sm text-slate-600">{example.translation}</div>
                          </div>
                          <div className="ml-auto">
                            <div className={`px-2 py-1 bg-${example.color}-500/20 text-${example.color}-600 text-xs rounded-full`}>
                              {t(`filter${example.status}` as any)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t("visibleProgress")}</span>
                      <span className="font-medium text-slate-800">3 {t("wordsCount")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-100/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              {t("featuresTitle")}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t("featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                {t("benefitsTitle")}
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                {t("benefitsSubtitle")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{t("focusOnWhatMatters")}</div>
                      <div className="text-sm text-slate-600">{t("focusDesc")}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{t("multilingual")}</div>
                      <div className="text-sm text-slate-600">{t("multilingualDesc")}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{t("visibleProgress")}</div>
                      <div className="text-sm text-slate-600">{t("visibleProgressDesc")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t("ctaTitle")}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("ctaSubtitle")}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              size="lg"
              className="h-16 px-12 text-xl font-semibold bg-white text-blue-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-blue-600">{t("signingIn")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-blue-600">{t("startNowFree")}</span>
                  <ArrowRight className="h-6 w-6 text-blue-600" />
                </div>
              )}
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-blue-200 text-sm">
              {t("noCreditCard")}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-slate-600">
            <p className="mb-2">{t("footerCopyright")} <a href="https://linkedin.com/in/Kecbm" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-blue-600 transition-colors duration-200">Klecianny Melo</a>.</p>
            <p className="text-sm">{t("footerTagline")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
