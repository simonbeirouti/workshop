import PropTypes from "prop-types";

export const Button = ({ children, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center text-center gap-2 border-black dark:border-lavender-blue-500 border-[3px] transition-all rounded-sm py-2 px-10 my-2 text-white bg-lavender-blue-500 dark:bg-black shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_#7888ff] ${disabled ? "opacity-25" : "hover:bg-lavender-blue-600 dark:hover:bg-lavender-blue-300 dark:hover:text-black active:bg-lavender-blue-400 dark:active:bg-lavender-blue-500 active:shadow-none active:translate-x-[8px] active:translate-y-[8px]"}`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
