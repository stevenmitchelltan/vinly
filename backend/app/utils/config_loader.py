"""
YAML Configuration Loader
Loads all keyword and configuration files
"""
import yaml
import os
from typing import Dict, List


class ConfigLoader:
    def __init__(self):
        self.config_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'config'
        )
        self._supermarkets = None
        self._wine_keywords = None
        self._scraping_settings = None
        self._lexicon = None
    
    def load_yaml(self, filename: str) -> Dict:
        """Load a YAML file from config directory"""
        filepath = os.path.join(self.config_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    
    @property
    def supermarkets(self) -> Dict:
        """Load supermarket configuration"""
        if self._supermarkets is None:
            self._supermarkets = self.load_yaml('supermarkets.yaml')
        return self._supermarkets
    
    @property
    def wine_keywords(self) -> Dict:
        """Load wine keywords configuration"""
        if self._wine_keywords is None:
            self._wine_keywords = self.load_yaml('wine_keywords.yaml')
        return self._wine_keywords
    
    @property
    def scraping_settings(self) -> Dict:
        """Load scraping settings"""
        if self._scraping_settings is None:
            self._scraping_settings = self.load_yaml('scraping_settings.yaml')
        return self._scraping_settings

    @property
    def lexicon(self) -> Dict:
        """Load wine lexicon configuration"""
        if self._lexicon is None:
            try:
                self._lexicon = self.load_yaml('lexicon.yaml')
            except FileNotFoundError:
                # Provide safe defaults if file missing
                self._lexicon = {
                    'supermarkets': [],
                    'brands': [],
                    'grapes': [],
                    'regions': [],
                    'wine_terms': []
                }
        return self._lexicon

    def get_prompt_terms(self, max_items: int = 80) -> list:
        """Collect top-N prompt terms from lexicon, deduplicated preserving order."""
        # Allow override from settings
        settings_max = (self.scraping_settings.get('asr', {}) or {}).get('prompt_terms_max')
        if isinstance(settings_max, int) and settings_max > 0:
            max_items = min(max_items, settings_max)
        terms = []
        for key in ['supermarkets', 'brands', 'grapes', 'regions', 'wine_terms']:
            items = self.lexicon.get(key, []) or []
            for item in items:
                if item and item not in terms:
                    terms.append(item)
                if len(terms) >= max_items:
                    return terms[:max_items]
        return terms[:max_items]

    def _strip_accents(self, s: str) -> str:
        import unicodedata
        return ''.join(
            c for c in unicodedata.normalize('NFKD', s)
            if not unicodedata.combining(c)
        )

    def is_wine_like_token(self, token: str) -> bool:
        """
        Heuristic: Tokens that look like wine names/brands (proper nouns, diacritics, hyphenated)
        or that approximately appear in the lexicon (accent-folded membership).
        """
        if not token or len(token) < 3:
            return False
        stripped = token.strip().strip('.,:;!()[]{}\"\'')
        if not stripped:
            return False
        has_upper = any(c.isupper() for c in stripped)
        has_dash = '-' in stripped or '’' in stripped or '\'' in stripped
        # Accent presence
        accent_fold_changed = self._strip_accents(stripped) != stripped
        # Lexicon approx membership
        folded = self._strip_accents(stripped).lower()
        for key in ['brands', 'grapes', 'regions', 'wine_terms', 'supermarkets']:
            for entry in self.lexicon.get(key, []) or []:
                if self._strip_accents(str(entry)).lower() == folded:
                    return True
        return has_upper or has_dash or accent_fold_changed
    
    def get_supermarket_list(self) -> List[str]:
        """Get list of supermarket names"""
        return [sm['name'] for sm in self.supermarkets['supermarkets']]
    
    def get_all_supermarket_keywords(self) -> List[str]:
        """Get all supermarket keywords including aliases"""
        keywords = []
        
        # Add all aliases from each supermarket
        for sm in self.supermarkets['supermarkets']:
            keywords.extend(sm['aliases'])
        
        # Add general keywords
        keywords.extend(self.supermarkets.get('general_keywords', []))
        
        return keywords
    
    def normalize_supermarket_name(self, alias: str) -> str:
        """
        Convert supermarket alias to official name
        e.g., "ah" -> "Albert Heijn"
        """
        alias_lower = alias.lower().strip()
        
        for sm in self.supermarkets['supermarkets']:
            if alias_lower in [a.lower() for a in sm['aliases']]:
                return sm['name']
        
        return alias  # Return as-is if no match


# Global instance
config = ConfigLoader()

