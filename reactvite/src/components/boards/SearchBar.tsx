import searchIcon from '../../assets/search.svg';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <img src={searchIcon} alt="Search" />
      <input
        type="text"
        placeholder=""
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
