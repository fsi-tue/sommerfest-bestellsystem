import Timeline from "@/app/components/Timeline"; // Assuming .tsx or adjust if needed
import ErrorMessage from "@/app/components/ErrorMessage"; // Assuming .tsx or adjust
import { OrderType } from '../page'; // Assuming OrderType is exported from page.tsx or moved to types file

interface OrderSectionProps {
    order: OrderType;
    error: string;
    start: Date;
    end: Date;
    everyXSeconds: number;
    selectedTimeslot: string | null; // Pass selected timeslot for Timeline highlighting
    onSetName: (name: string) => void;
    onSetTimeslot: (timeslot: string) => void; // Parent handler already contains validation
}

const OrderSection = ({
                          order,
                          error,
                          start,
                          end,
                          everyXSeconds,
                          selectedTimeslot,
                          onSetName,
                          onSetTimeslot,
                      }: OrderSectionProps) => {
    return (
        <div className="md:w-1/2 w-full">
            <a id="order" className="block -mt-20 pt-20"></a> {/* Anchor for scrolling, adjusted offset */}
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Your Details & Pick-up</h3>
            {error && <ErrorMessage error={error}/>}

            {/* Form Inputs */}
            <div className="mb-6 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={order.name} // Controlled component
                        placeholder="Enter your name"
                        className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                        onChange={(e) => onSetName(e.target.value)}
                        required // Added required attribute
                    />
                </div>
            </div>

            {/* Timeline Section */}
            <div className="timeline-container mt-8">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Timeslot</h4> {/* Adjusted heading level */}
                <p className="mb-4 text-base font-light leading-relaxed text-gray-700"> {/* Adjusted text size/leading */}
                    Select your preferred pick-up time.
                </p>
                <Timeline
                    startDate={start}
                    stopDate={end}
                    setTimeslot={onSetTimeslot} // Pass handler directly
                    every_x_seconds={everyXSeconds}
                />
            </div>
        </div>
    );
};

export default OrderSection;
