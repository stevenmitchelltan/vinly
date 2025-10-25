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

