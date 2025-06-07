const ErrorMessage = ({error, t}) => {
	return (
		<div className="text-red-500">
			{error}
			<p className="text-sm text-gray-500">
				{t('components.errormessage.please_try_again')}
			</p>
		</div>
	);
}

export default ErrorMessage;
