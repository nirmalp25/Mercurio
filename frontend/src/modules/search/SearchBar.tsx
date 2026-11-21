import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { catalogueApi } from '@/shared/api/endpoints';
import { searchConfig } from '@/shared/config';
import type { SearchConfig } from '@/shared/config/schema';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface SearchBarProps {
  config?: SearchConfig;
}

/**
 * Search input with debounced autocomplete. Suggestions are fetched only after typing pauses
 * (config.debounceMs); outdated requests are aborted by React Query's AbortSignal.
 * Results are shown only when the user submits (button or Enter), as per the acceptance criteria.
 */
export function SearchBar({ config = searchConfig }: SearchBarProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const listId = useId();

  const [term, setTerm] = useState(() => params.get('q') ?? '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounced = useDebounce(term.trim(), config.debounceMs);
  const enabled = open && debounced.length >= config.minChars;

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggest', debounced, config.suggestLimit],
    queryFn: ({ signal }) => catalogueApi.suggest(debounced, config.suggestLimit, signal),
    enabled,
    staleTime: 60_000,
  });

  const visible = enabled && suggestions.length > 0;

  useEffect(() => setActiveIndex(-1), [debounced]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function choose(index: number) {
    const suggestion = suggestions[index];
    if (!suggestion) return;
    setOpen(false);
    setTerm(suggestion.title);
    navigate(`/products/${suggestion.id}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!visible) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      choose(activeIndex);
    }
  }

  return (
    <form className="search" role="search" onSubmit={submit}>
      <div className="search__field">
        <input
          type="search"
          className="input search__input"
          aria-label="Search products"
          placeholder={config.placeholder}
          value={term}
          maxLength={100}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          data-testid="search-input"
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
        />
        {visible && (
          <ul id={listId} role="listbox" className="search__suggestions" data-testid="search-suggestions">
            {suggestions.map((s, index) => (
              <li
                key={s.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? 'is-active' : undefined}
                onMouseDown={(e) => e.preventDefault()} // keep focus so click registers before blur
                onClick={() => choose(index)}
              >
                <span>{s.title}</span>
                <small>{s.category}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="btn btn--primary" data-testid="search-button">
        {config.buttonLabel}
      </button>
    </form>
  );
}
