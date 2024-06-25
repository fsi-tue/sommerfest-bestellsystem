'use client'

export const ErrorMessage = ({error}) => {
	return (
		<div className="text-red-500 text-center">
			{error}
			<p className="text-sm text-gray-500">
				Please reload the page and try again.
			</p>
		</div>
	);
}
