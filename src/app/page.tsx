"use client";

import { useState, useEffect } from "react";
import {
  type Environments,
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

type CheckoutVariant = "multi-page" | "one-page";

interface CustomisationOptions {
  theme: "light" | "dark";
  displayMode: "inline" | "overlay";
  locale: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
  maxWidth: number;
  boxShadow: string;
  variant: CheckoutVariant;
  showAddDiscount: boolean;
  showAddTaxId: boolean;
}

const SUPPORTED_LOCALES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "ja",
  "ko",
  "pt",
  "ru",
  "zh",
];

const SHADOW_PRESETS = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
};

export default function CustomisePage() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [options, setOptions] = useState<CustomisationOptions>({
    theme: "light",
    displayMode: "inline",
    locale: "en",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    maxWidth: 1200,
    boxShadow: SHADOW_PRESETS.sm,
    variant: "one-page",
    showAddDiscount: false,
    showAddTaxId: false,
  });

  const openCheckout = async (
    paddleInstance: Paddle,
    updatedOptions: CustomisationOptions
  ) => {
    const frameStyle = `
      width: 100%;
      background-color: ${updatedOptions.theme === "dark" ? "#1a1a1a" : updatedOptions.backgroundColor};
      border: ${updatedOptions.borderWidth}px solid ${updatedOptions.theme === "dark" ? "#2d2d2d" : updatedOptions.borderColor};
      border-radius: ${updatedOptions.borderRadius}px;
      padding: ${updatedOptions.padding}px;
      max-width: ${updatedOptions.maxWidth}px;
      box-shadow: ${updatedOptions.boxShadow};
      margin: 0 auto;
    `;

    await paddleInstance.Checkout.open({
      settings: {
        theme: updatedOptions.theme,
        displayMode: updatedOptions.displayMode,
        locale: updatedOptions.locale,
        frameTarget: "paddle-checkout-frame",
        frameStyle,
        variant: updatedOptions.variant,
        showAddDiscounts: updatedOptions.showAddDiscount,
        showAddTaxId: updatedOptions.showAddTaxId,
      },
      items: [{ priceId: "pri_01jpcpfewb85r1etjvw2yg3j7j", quantity: 1 }],
    });
  };

  const initializeCheckout = async (updatedOptions: CustomisationOptions) => {
    if (
      !process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ||
      !process.env.NEXT_PUBLIC_PADDLE_ENV
    ) {
      return;
    }

    if (!paddle?.Initialized) {
      const newPaddle = await initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
      });

      if (newPaddle) {
        setPaddle(newPaddle);
        await openCheckout(newPaddle, updatedOptions);
      }
    } else {
      await openCheckout(paddle, updatedOptions);
    }
  };

  const updateCheckout = async (newOptions: Partial<CustomisationOptions>) => {
    const isDisplayModeChange =
      newOptions.displayMode !== undefined &&
      newOptions.displayMode !== options.displayMode;
    const isChangingToInline =
      isDisplayModeChange && newOptions.displayMode === "inline";
    const isChangingToOverlay =
      isDisplayModeChange && newOptions.displayMode === "overlay";

    const updatedOptions = { ...options, ...newOptions };

    if (newOptions.theme) {
      updatedOptions.backgroundColor =
        newOptions.theme === "dark" ? "#1a1a1a" : "#ffffff";
      updatedOptions.borderColor =
        newOptions.theme === "dark" ? "#2d2d2d" : "#e5e7eb";
    }

    setOptions(updatedOptions);

    if (
      (updatedOptions.displayMode === "inline" && !isChangingToOverlay) ||
      isChangingToInline
    ) {
      if (isChangingToInline) {
        setTimeout(() => initializeCheckout(updatedOptions), 100);
      } else {
        await initializeCheckout(updatedOptions);
      }
    }
  };

  useEffect(() => {
    const initialOptions = { ...options };
    if (initialOptions.displayMode === "inline") {
      initializeCheckout(initialOptions);
    } else if (
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
      process.env.NEXT_PUBLIC_PADDLE_ENV
    ) {
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
      }).then((newPaddle) => newPaddle && setPaddle(newPaddle));
    }
  }, []);

  return (
    <div
      className={`min-h-screen ${options.theme === "dark" ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-200`}
    >
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <header className="mb-12 text-center">
          <h1
            className={`text-3xl font-bold ${options.theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Paddle Checkout Customiser
          </h1>
          <p
            className={`mt-2 ${options.theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            Customise your checkout experience in real-time
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card
            className={`${options.theme === "dark" ? "bg-gray-800 border-gray-700 shadow-gray-900" : "bg-white border-gray-200"} shadow-lg rounded-xl overflow-hidden`}
          >
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle
                className={`${options.theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Customisation Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <TabsTrigger
                    value="basic"
                    className="rounded-md text-gray-700 dark:text-gray-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
                  >
                    Basic Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="styling"
                    className="rounded-md text-gray-700 dark:text-gray-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
                  >
                    Styling Options
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label
                        className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                      >
                        Display Mode
                      </Label>
                      <Select
                        value={options.displayMode}
                        onValueChange={(value) =>
                          updateCheckout({
                            displayMode: value as "inline" | "overlay",
                          })
                        }
                      >
                        <SelectTrigger
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            options.theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : ""
                          }
                        >
                          <SelectItem value="inline">Inline</SelectItem>
                          <SelectItem value="overlay">Overlay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                      >
                        Theme
                      </Label>
                      <Select
                        value={options.theme}
                        onValueChange={(value) =>
                          updateCheckout({ theme: value as "light" | "dark" })
                        }
                      >
                        <SelectTrigger
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            options.theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : ""
                          }
                        >
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                      >
                        Locale
                      </Label>
                      <Select
                        value={options.locale}
                        onValueChange={(value) =>
                          updateCheckout({ locale: value })
                        }
                      >
                        <SelectTrigger
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            options.theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : ""
                          }
                        >
                          {SUPPORTED_LOCALES.map((locale) => (
                            <SelectItem key={locale} value={locale}>
                              {locale.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                      >
                        Checkout Flow
                      </Label>
                      <Select
                        value={options.variant}
                        onValueChange={(value: CheckoutVariant) =>
                          updateCheckout({ variant: value })
                        }
                      >
                        <SelectTrigger
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            options.theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : ""
                          }
                        >
                          <SelectItem value="one-page">One Page</SelectItem>
                          <SelectItem value="multi-page">Multi-Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-gray-600">
                      <h3
                        className={`text-sm font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                      >
                        Additional Features
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showAddDiscount"
                            checked={options.showAddDiscount}
                            onCheckedChange={(checked) =>
                              updateCheckout({ showAddDiscount: !!checked })
                            }
                            className={
                              options.theme === "dark"
                                ? "border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                : ""
                            }
                          />
                          <Label
                            htmlFor="showAddDiscount"
                            className={`cursor-pointer text-sm ${options.theme === "dark" ? "text-gray-200" : ""}`}
                          >
                            Show Discount Field
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showAddTaxId"
                            checked={options.showAddTaxId}
                            onCheckedChange={(checked) =>
                              updateCheckout({ showAddTaxId: !!checked })
                            }
                            className={
                              options.theme === "dark"
                                ? "border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                : ""
                            }
                          />
                          <Label
                            htmlFor="showAddTaxId"
                            className={`cursor-pointer text-sm ${options.theme === "dark" ? "text-gray-200" : ""}`}
                          >
                            Show Tax ID Field
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="styling" className="space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label
                        className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                      >
                        Background Color
                      </Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          type="color"
                          value={options.backgroundColor}
                          onChange={(e) =>
                            updateCheckout({ backgroundColor: e.target.value })
                          }
                          className="w-14 h-14 p-1 rounded-md border"
                        />
                        <Input
                          type="text"
                          value={options.backgroundColor}
                          onChange={(e) =>
                            updateCheckout({ backgroundColor: e.target.value })
                          }
                          className={`flex-1 ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                      >
                        Border Color
                      </Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          type="color"
                          value={options.borderColor}
                          onChange={(e) =>
                            updateCheckout({ borderColor: e.target.value })
                          }
                          className="w-14 h-14 p-1 rounded-md border"
                        />
                        <Input
                          type="text"
                          value={options.borderColor}
                          onChange={(e) =>
                            updateCheckout({ borderColor: e.target.value })
                          }
                          className={`flex-1 ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                        >
                          Border Width (px)
                        </Label>
                        <Input
                          type="number"
                          value={options.borderWidth}
                          onChange={(e) =>
                            updateCheckout({
                              borderWidth: parseInt(e.target.value),
                            })
                          }
                          min={0}
                          max={10}
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                        >
                          Border Radius (px)
                        </Label>
                        <Input
                          type="number"
                          value={options.borderRadius}
                          onChange={(e) =>
                            updateCheckout({
                              borderRadius: parseInt(e.target.value),
                            })
                          }
                          min={0}
                          max={50}
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                        >
                          Padding (px)
                        </Label>
                        <Input
                          type="number"
                          value={options.padding}
                          onChange={(e) =>
                            updateCheckout({
                              padding: parseInt(e.target.value),
                            })
                          }
                          min={0}
                          max={100}
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                        >
                          Max Width (px)
                        </Label>
                        <Input
                          type="number"
                          value={options.maxWidth}
                          onChange={(e) =>
                            updateCheckout({
                              maxWidth: parseInt(e.target.value),
                            })
                          }
                          min={400}
                          max={2000}
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`font-medium ${options.theme === "dark" ? "text-gray-200" : ""}`}
                      >
                        Box Shadow
                      </Label>
                      <Select
                        value={options.boxShadow}
                        onValueChange={(value) =>
                          updateCheckout({ boxShadow: value })
                        }
                      >
                        <SelectTrigger
                          className={`w-full ${options.theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            options.theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : ""
                          }
                        >
                          {Object.entries(SHADOW_PRESETS).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {options.displayMode === "overlay" && (
                <Button
                  onClick={() => initializeCheckout(options)}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Preview Overlay Checkout
                </Button>
              )}
            </CardContent>
          </Card>

          <Card
            className={`${options.theme === "dark" ? "bg-gray-800 border-gray-700 shadow-gray-900" : "bg-white border-gray-200"} shadow-lg rounded-xl overflow-hidden`}
          >
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle
                className={`${options.theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative min-h-[500px]">
                {options.displayMode === "inline" && (
                  <div className="paddle-checkout-frame w-full" />
                )}
                {options.displayMode === "overlay" && (
                  <div
                    className={`flex items-center justify-center min-h-[500px] rounded-lg ${options.theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                  >
                    <div className="text-center space-y-4">
                      <p
                        className={`${options.theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        Click &quot;Preview Overlay Checkout&quot; to see the
                        overlay
                      </p>
                      <div className="w-48 h-32 mx-auto bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
