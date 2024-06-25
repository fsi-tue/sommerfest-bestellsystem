'use client'

export const ErrorMessage = ({error}) => {
	return (
		<div className="text-red-500">
			{error}
			<p className="text-sm text-gray-500">
				Please try again.
			</p>
		</div>
	);
}
