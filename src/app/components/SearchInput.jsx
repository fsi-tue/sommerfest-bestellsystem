import {useEffect, useRef, useState} from 'react';

const SearchInput = ({search, searchValue}) => {
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef();

	const handleClear = () => {
		setInputValue('');
		search('');
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	// Set input value to filter
	useEffect(() => {
		if (searchValue) {
			setInputValue(searchValue);
		}
	}, [searchValue]);

	return (
		<div className="relative w-full mb-4">
			<input
				type="text"
				placeholder="Search by Name, OrderId, State or Pizza"
				className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 pr-10"
				onChange={(e) => {
					setInputValue(e.target.value);
					search(e.target.value);
				}}
				value={inputValue}
				ref={inputRef}
			/>
			{inputValue && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-1 focus:outline-none hover:bg-gray-300 transition duration-200"
				>
					<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					     xmlns="http://www.w3.org/2000/svg">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			)}
		</div>
	);
};

export default SearchInput;
