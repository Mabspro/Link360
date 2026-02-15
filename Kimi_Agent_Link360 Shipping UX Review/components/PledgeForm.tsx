'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Package, 
  Truck, 
  User, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Info,
  MapPin,
  Box,
  Ruler
} from 'lucide-react';

// Standard box definitions
const STANDARD_BOXES = {
  S: { name: 'Small', dims: [18, 18, 18], ft3: 3.375 },
  M: { name: 'Medium', dims: [24, 24, 24], ft3: 8 },
  L: { name: 'Large', dims: [24, 24, 48], ft3: 16 },
  TV: { name: 'TV Box', dims: [18, 18, 48], ft3: 9 },
};

const ESTIMATE_SIZES = {
  small: { label: 'Small (shoebox)', ft3: 1 },
  medium: { label: 'Medium (moving box)', ft3: 5 },
  large: { label: 'Large (furniture)', ft3: 20 },
};

// Validation schema
const pledgeSchema = z.object({
  itemMode: z.enum(['standard_box', 'custom_dims', 'estimate']),
  standardBoxCode: z.string().optional(),
  lengthIn: z.number().min(0).optional(),
  widthIn: z.number().min(0).optional(),
  heightIn: z.number().min(0).optional(),
  estimateSize: z.enum(['small', 'medium', 'large']).optional(),
  quantity: z.number().min(1).max(100),
  pickupZone: z.enum(['in_city', 'out_of_city']),
  pickupCity: z.string().min(1),
  userName: z.string().min(2, 'Name is required'),
  userEmail: z.string().email('Valid email required'),
  userPhone: z.string().optional(),
  notes: z.string().optional(),
});

type PledgeFormData = z.infer<typeof pledgeSchema>;

interface PricingConfig {
  ratePerIn3: number;
  inCityStopFee: number;
  outOfCityBaseFee: number;
  outOfCityPerBoxFee: number;
}

interface PledgeFormProps {
  poolId: string;
  pricing: PricingConfig;
  onSubmit: (data: PledgeFormData & { 
    computedIn3: number;
    computedFt3: number;
    estShippingCost: number;
    estPickupFee: number;
  }) => Promise<void>;
}

const steps = [
  { id: 'items', label: 'Items', icon: Package },
  { id: 'pickup', label: 'Pickup', icon: Truck },
  { id: 'contact', label: 'Contact', icon: User },
  { id: 'review', label: 'Review', icon: Check },
];

export function PledgeForm({ poolId, pricing, onSubmit }: PledgeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
    handleSubmit,
  } = useForm<PledgeFormData>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      itemMode: 'standard_box',
      standardBoxCode: 'M',
      quantity: 1,
      pickupZone: 'in_city',
      pickupCity: '',
      userName: '',
      userEmail: '',
      userPhone: '',
      notes: '',
    },
  });

  const formValues = watch();

  // Calculate costs
  const calculateCosts = () => {
    let in3 = 0;
    const qty = formValues.quantity || 1;

    if (formValues.itemMode === 'standard_box' && formValues.standardBoxCode) {
      const box = STANDARD_BOXES[formValues.standardBoxCode as keyof typeof STANDARD_BOXES];
      in3 = box.dims[0] * box.dims[1] * box.dims[2] * qty;
    } else if (formValues.itemMode === 'custom_dims') {
      in3 = (formValues.lengthIn || 0) * (formValues.widthIn || 0) * (formValues.heightIn || 0) * qty;
    } else if (formValues.itemMode === 'estimate' && formValues.estimateSize) {
      const est = ESTIMATE_SIZES[formValues.estimateSize];
      in3 = est.ft3 * 1728 * qty;
    }

    const ft3 = in3 / 1728;
    const shippingCost = in3 * pricing.ratePerIn3;
    const pickupFee = formValues.pickupZone === 'in_city' 
      ? pricing.inCityStopFee 
      : pricing.outOfCityBaseFee + (pricing.outOfCityPerBoxFee * qty);

    return { in3, ft3, shippingCost, pickupFee, total: shippingCost + pickupFee };
  };

  const costs = calculateCosts();

  const validateStep = async () => {
    const stepFields: Record<number, string[]> = {
      0: ['itemMode', 'quantity'],
      1: ['pickupZone', 'pickupCity'],
      2: ['userName', 'userEmail'],
      3: [],
    };

    const fields = stepFields[currentStep];
    if (fields.length === 0) return true;
    
    const result = await trigger(fields as any);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFormSubmit = async (data: PledgeFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        computedIn3: costs.in3,
        computedFt3: costs.ft3,
        estShippingCost: costs.shippingCost,
        estPickupFee: costs.pickupFee,
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <SuccessState />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-400'
                    }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </motion.div>
                  <span className={`mt-2 text-xs font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {currentStep === 0 && (
              <StepItems control={control} watch={watch} setValue={setValue} errors={errors} />
            )}
            {currentStep === 1 && (
              <StepPickup control={control} watch={watch} errors={errors} />
            )}
            {currentStep === 2 && (
              <StepContact control={control} errors={errors} />
            )}
            {currentStep === 3 && (
              <StepReview formValues={formValues} costs={costs} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pt-0 border-t border-gray-100">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Pledge
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Running Total */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Estimated Total</span>
          <span className="text-2xl font-bold text-gray-900">${costs.total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          No payment required until container is confirmed
        </p>
      </div>
    </div>
  );
}

// Step 1: Items
function StepItems({ control, watch, setValue, errors }: any) {
  const itemMode = watch('itemMode');
  const standardBoxCode = watch('standardBoxCode');
  const quantity = watch('quantity');
  const estimateSize = watch('estimateSize');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">What are you shipping?</h3>
        <p className="text-sm text-gray-500">Select the option that best describes your items</p>
      </div>

      {/* Item Mode Selection */}
      <Controller
        name="itemMode"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'standard_box', label: 'Standard Box', icon: Box },
              { id: 'custom_dims', label: 'Custom Size', icon: Ruler },
              { id: 'estimate', label: 'Estimate', icon: Info },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => field.onChange(option.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    field.value === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${field.value === option.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${field.value === option.id ? 'text-blue-900' : 'text-gray-600'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      />

      {/* Standard Box Selection */}
      {itemMode === 'standard_box' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <p className="text-sm font-medium text-gray-700">Choose your box size:</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(STANDARD_BOXES).map(([code, box]) => (
              <button
                key={code}
                type="button"
                onClick={() => setValue('standardBoxCode', code)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  standardBoxCode === code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{box.name}</span>
                  {standardBoxCode === code && <Check className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-sm text-gray-500">{box.dims.join('×')}"</p>
                <p className="text-sm text-gray-400">~{box.ft3} ft³</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Custom Dimensions */}
      {itemMode === 'custom_dims' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <p className="text-sm font-medium text-gray-700">Enter dimensions (inches):</p>
          <div className="grid grid-cols-3 gap-3">
            {['lengthIn', 'widthIn', 'heightIn'].map((dim) => (
              <div key={dim}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">
                  {dim.replace('In', '')}
                </label>
                <Controller
                  name={dim}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Estimate */}
      {itemMode === 'estimate' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <p className="text-sm font-medium text-gray-700">Roughly how much space?</p>
          <div className="space-y-2">
            {Object.entries(ESTIMATE_SIZES).map(([key, size]) => (
              <button
                key={key}
                type="button"
                onClick={() => setValue('estimateSize', key)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  estimateSize === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-900">{size.label}</span>
                <span className="text-sm text-gray-500">~{size.ft3} ft³</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => field.onChange(Math.max(1, field.value - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-12 text-center font-semibold text-lg">{field.value}</span>
              <button
                type="button"
                onClick={() => field.onChange(field.value + 1)}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}

// Step 2: Pickup
function StepPickup({ control, watch, errors }: any) {
  const pickupZone = watch('pickupZone');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Pickup Location</h3>
        <p className="text-sm text-gray-500">Where should we collect your items?</p>
      </div>

      {/* Pickup Zone */}
      <Controller
        name="pickupZone"
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            {[
              { id: 'in_city', label: 'In-City Pickup', price: '$25', desc: 'Within city limits' },
              { id: 'out_of_city', label: 'Out-of-City Pickup', price: '$25 + $15/box', desc: 'Outside city limits' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => field.onChange(option.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  field.value === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 mt-0.5 ${field.value === option.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">{option.price}</span>
              </button>
            ))}
          </div>
        )}
      />

      {/* Pickup City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pickup City <span className="text-red-500">*</span>
        </label>
        <Controller
          name="pickupCity"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Sacramento"
            />
          )}
        />
        {errors.pickupCity && (
          <p className="mt-1 text-sm text-red-500">{errors.pickupCity.message}</p>
        )}
      </div>
    </div>
  );
}

// Step 3: Contact
function StepContact({ control, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Contact Information</h3>
        <p className="text-sm text-gray-500">We'll send confirmation to this email</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            )}
          />
          {errors.userName && (
            <p className="mt-1 text-sm text-red-500">{errors.userName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Controller
            name="userEmail"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            )}
          />
          {errors.userEmail && (
            <p className="mt-1 text-sm text-red-500">{errors.userEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-gray-400">(optional)</span>
          </label>
          <Controller
            name="userPhone"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes <span className="text-gray-400">(optional)</span>
          </label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Any special instructions or questions..."
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Review
function StepReview({ formValues, costs }: any) {
  const boxName = formValues.standardBoxCode 
    ? STANDARD_BOXES[formValues.standardBoxCode as keyof typeof STANDARD_BOXES]?.name 
    : 'Custom';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Review Your Pledge</h3>
        <p className="text-sm text-gray-500">Please confirm your details before submitting</p>
      </div>

      <div className="space-y-4">
        {/* Items Summary */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> Items
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item type</span>
              <span className="font-medium">{boxName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity</span>
              <span className="font-medium">{formValues.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total volume</span>
              <span className="font-medium">{costs.ft3.toFixed(2)} ft³</span>
            </div>
          </div>
        </div>

        {/* Pickup Summary */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4" /> Pickup
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup zone</span>
              <span className="font-medium capitalize">{formValues.pickupZone.replace('_', '-')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">City</span>
              <span className="font-medium">{formValues.pickupCity}</span>
            </div>
          </div>
        </div>

        {/* Contact Summary */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> Contact
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{formValues.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{formValues.userEmail}</span>
            </div>
            {formValues.userPhone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium">{formValues.userPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Cost Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Shipping cost</span>
              <span className="font-medium text-blue-900">${costs.shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Pickup fee</span>
              <span className="font-medium text-blue-900">${costs.pickupFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Total Estimated Cost</span>
                <span className="font-bold text-lg text-blue-900">${costs.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          🔒 No payment required now. We'll contact you when the container is confirmed.
        </p>
      </div>
    </div>
  );
}

// Success State
function SuccessState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Check className="w-10 h-10 text-green-600" />
      </motion.div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Pledge Submitted!</h3>
      <p className="text-gray-600 mb-6">
        Thank you! We've received your pledge and sent a confirmation email.
      </p>
      
      <div className="flex gap-3 justify-center">
        <a
          href="/"
          className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Back to Home
        </a>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Make Another Pledge
        </button>
      </div>
    </motion.div>
  );
}
