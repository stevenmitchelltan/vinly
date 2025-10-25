"""
Test improved filtering and wine extraction
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from scripts.smart_scraper import is_supermarket_wine_video
from app.services.wine_extractor import extract_wines_from_text


def test_filtering():
    """Test the improved filtering logic"""
    
    print("\n" + "="*60)
    print("  TESTING IMPROVED FILTERING")
    print("="*60)
    print()
    
    # Test cases
    test_captions = [
        # SHOULD PASS (supermarket wine content)
        ("LIDL wijn test! Deze week test ik wijnen van de LIDL #wijn", True),
        ("Supermarkt wijnen onder de 10 euro #supermarktwijn", True),
        ("AH wijn test! Vandaag bij de Appie #wijn", True),
        ("Top koopje bij de Plus! Deze wijn moet je halen", True),
        ("Jumbo rosé test #wijn #test", True),
        
        # SHOULD FAIL (not supermarket wine content)
        ("Wijn proeven op vakantie in Frankrijk", False),
        ("Hoe proef je wijn? Tips! #wijntips", False),
        ("Mijn wijncollectie thuis #wijn", False),
        ("Examen dag vandaag", False),
        ("Wat is biologische wijn?", False),
    ]
    
    print("Testing filter logic:")
    print()
    
    passed = 0
    failed = 0
    
    for caption, should_pass in test_captions:
        result = is_supermarket_wine_video(caption)
        status = "PASS" if result == should_pass else "FAIL"
        
        if result == should_pass:
            passed += 1
            symbol = "[OK]"
        else:
            failed += 1
            symbol = "[!!]"
        
        print(f"{symbol} {status}: '{caption[:50]}...'")
        print(f"     Expected: {should_pass}, Got: {result}")
        print()
    
    print("="*60)
    print(f"Results: {passed} passed, {failed} failed")
    print("="*60)
    print()


def test_wine_extraction():
    """Test improved wine extraction (only recommended wines)"""
    
    print("\n" + "="*60)
    print("  TESTING WINE EXTRACTION")
    print("="*60)
    print()
    
    # Test case with both good and bad wines
    mixed_review = """
    LIDL rode wijn test! 
    
    Deze week test ik 3 rode wijnen van de LIDL:
    
    1. Cotes du Rhone - ABSOLUTE AANRADER! Voor 6 euro krijg je hier echt kwaliteit. 8/10
    2. Primitivo - Matig, niet lekker. Te zuur. 4/10 - SKIP DEZE
    3. Merlot - Niks bijzonders, er zijn betere opties. 5/10
    
    Conclusie: Alleen de eerste is het waard!
    """
    
    print("Test Caption:")
    print(mixed_review)
    print()
    print("Extracting wines...")
    print()
    
    wines = extract_wines_from_text(mixed_review)
    
    print("Results:")
    if wines:
        for wine in wines:
            print(f"  - {wine['name']} ({wine['supermarket']})")
            print(f"    Rating: {wine.get('rating', 'N/A')}")
            print(f"    Description: {wine.get('description', 'N/A')}")
            print()
    else:
        print("  No wines extracted")
    
    print()
    print("Expected: ONLY extract Cotes du Rhone (the recommended one)")
    print(f"Actual: Extracted {len(wines)} wine(s)")
    
    if len(wines) == 1:
        print("[SUCCESS] Correctly extracted only the recommended wine!")
    elif len(wines) > 1:
        print("[WARNING] Extracted bad wines too - prompt needs tuning")
    else:
        print("[ERROR] Didn't extract any wines - prompt too strict")
    
    print()


if __name__ == "__main__":
    print("\n" + "#"*60)
    print("#  IMPROVED SYSTEM TESTS")
    print("#"*60)
    
    test_filtering()
    test_wine_extraction()
    
    print("\n" + "#"*60)
    print("#  TESTS COMPLETE")
    print("#"*60)
    print()

