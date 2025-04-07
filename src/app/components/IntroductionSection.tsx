const IntroductionSection = () => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-center text-gray-900">
                Order your pizza at Sommerfest 2024!
            </h2>
            <div
                className="mb-8 font-light leading-relaxed text-gray-700 space-y-6"> {/* Adjusted text color/leading/spacing */}
                <ol className="list-decimal list-inside space-y-3">
                    <li>
                        <p className="text-lg font-semibold inline">Choose Pizza: </p>
                        <span>Select whole or halved from the list below (a whole pizza has a diameter of 12 inches / 30 cm).</span>
                    </li>
                    <li>
                        <p className="text-lg font-semibold inline">Pick-Up Time: </p>
                        <span>Choose a time (some slots may be full).</span>
                    </li>
                    <li>
                        <p className="text-lg font-semibold inline">Pay in Cash: </p>
                        <span>Pay when collecting at the counter.</span>
                    </li>
                </ol>
                <div className="mt-6 border-t pt-4"> {/* Added separator */}
                    <p className="text-lg font-semibold">Order Times:</p>
                    <p>Earliest pick-up: 17:25</p>
                    <p>Latest order: 23:40</p>
                </div>
                <p className="mt-8 text-center text-lg md:text-xl text-gray-600">Enjoy your evening!</p>
            </div>
        </div>
    );
};

export default IntroductionSection;
